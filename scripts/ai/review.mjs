#!/usr/bin/env node
// Claude 명세 대조 리뷰의 입력 준비와 결과 검증 (docs/workflow/claude-codex-plan.md 10.1)
//
// 사용법 (pr-validation.yml의 review 잡이 base 쪽 파일로 실행한다):
//   node scripts/ai/review.mjs prompt --template <md> --schema <json> --out-dir <dir>
//        --spec-id <ID> --spec-path <path> --spec-merge-sha <sha> --base <sha> --head <sha>
//     → <dir>/pr.diff, <dir>/files.txt를 만들고 GITHUB_OUTPUT에 prompt(여러 줄)·schema(한 줄)를 쓴다
//   node scripts/ai/review.mjs verify --spec-path <path> --spec-id <ID> --spec-merge-sha <sha> --base <sha> --head <sha>
//     → 환경변수 STRUCTURED_OUTPUT(Claude 결과 JSON)을 검증하고 GITHUB_OUTPUT에 ok·reason, 요약에 표를 쓴다
//
// 리뷰 성공 조건: 유효한 JSON + reviewed_head_sha·spec_merge_sha·spec_id 일치 + 명세의 수용 기준과 1:1 대응
//                + verdict=pass와 기준별 상태가 모순 없음. 빈 출력은 실패다.
// 판정 책임: [manual] 기준은 사람(status manual), CI 기준(spec-file.mjs isCiCriterion)은 같은 head의 ci 잡
//           (status ci, pr-gate가 ci 잡 성공을 요구), 그 외는 Claude 정적 리뷰. 그 외 기준의 cannot_determine은 실패다.

import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { UNIT_SPEC_PATH, readFileAt } from './classify-pr.mjs';
import { joinReasons, writeOutputs, writeSummary } from './gh-output.mjs';
import { parseSpec } from './spec-file.mjs';

const SHA = /^[0-9a-f]{40}$/;
// ci = 명세의 CI 기준(spec-file.mjs isCiCriterion). 같은 head의 ci 잡 성공으로 판정하며, pr-gate가 ci 잡 결과를 요구한다
const STATUSES = ['met', 'not_met', 'cannot_determine', 'manual', 'ci'];

// 명세가 정한 상태: [manual] → manual, CI 기준 → ci, 그 외 → 리뷰어가 판정 (manual·ci 사용 불가)
function fixedStatus(criterion) {
  if (criterion.manual) return 'manual';
  if (criterion.ci) return 'ci';
  return null;
}

export function ciCriteriaLabel(criteria) {
  const ids = criteria.filter((item) => item.ci).map((item) => item.id);
  return ids.length > 0 ? ids.join(', ') : '없음';
}

// 프롬프트에 끼워 넣는 값은 형식을 검증한 것만 쓴다 (PR이 정한 문자열이 지시문으로 들어가지 않게)
export function renderPrompt(template, values) {
  const checks = {
    SPEC_ID: (v) => UNIT_SPEC_PATH.test(`docs/specs/${v}.md`),
    SPEC_PATH: (v) => UNIT_SPEC_PATH.test(v),
    SPEC_MERGE_SHA: (v) => SHA.test(v),
    BASE_SHA: (v) => SHA.test(v),
    HEAD_SHA: (v) => SHA.test(v),
    DIFF_PATH: (v) => /^[A-Za-z0-9._/-]+$/.test(v),
    FILES_PATH: (v) => /^[A-Za-z0-9._/-]+$/.test(v),
    CI_CRITERIA: (v) => /^(?:AC-[0-9]{2,}(?:, AC-[0-9]{2,})*|없음)$/.test(v),
  };
  for (const [key, check] of Object.entries(checks)) {
    if (typeof values[key] !== 'string' || !check(values[key])) {
      throw new Error(`프롬프트 값 ${key}의 형식이 올바르지 않다: ${values[key]}`);
    }
  }
  const rendered = template.replace(/\{\{([A-Z_]+)\}\}/g, (whole, key) => {
    if (!(key in checks)) throw new Error(`알 수 없는 템플릿 변수: ${whole}`);
    return values[key];
  });
  return rendered;
}

// output: STRUCTURED_OUTPUT 문자열, criteria: 명세의 수용 기준 [{ id, manual, ci }]
export function verifyReview({ output, criteria, specId, specMergeSha, headSha }) {
  if (!output || !output.trim()) {
    return { ok: false, review: null, errors: ['Claude 결과가 비어 있다'] };
  }
  let review;
  try {
    review = JSON.parse(output);
  } catch (error) {
    return { ok: false, review: null, errors: [`Claude 결과가 JSON이 아니다: ${error.message}`] };
  }
  if (review === null || typeof review !== 'object' || !Array.isArray(review.criteria)) {
    return { ok: false, review: null, errors: ['Claude 결과에 criteria 배열이 없다'] };
  }

  const errors = [];
  if (!['pass', 'fail'].includes(review.verdict)) {
    errors.push(`verdict '${review.verdict}'가 pass·fail이 아니다`);
  }
  if (review.reviewed_head_sha !== headSha) {
    errors.push('reviewed_head_sha가 현재 head와 다르다');
  }
  if (review.spec_merge_sha !== specMergeSha) {
    errors.push('spec_merge_sha가 메타데이터와 다르다');
  }
  if (review.spec_id !== specId) {
    errors.push(`spec_id '${review.spec_id}'가 '${specId}'와 다르다`);
  }
  if (!Array.isArray(review.blocking_issues)) {
    errors.push('blocking_issues 배열이 없다');
  }

  const expected = new Map(criteria.map((item) => [item.id, item]));
  const seen = new Set();
  for (const item of review.criteria) {
    if (!expected.has(item?.id)) {
      errors.push(`명세에 없는 수용 기준: ${item?.id}`);
      continue;
    }
    if (seen.has(item.id)) {
      errors.push(`수용 기준 ${item.id}이 두 번 나왔다`);
      continue;
    }
    seen.add(item.id);
    const fixed = fixedStatus(expected.get(item.id));
    if (!STATUSES.includes(item.status)) {
      errors.push(`${item.id}의 status '${item.status}'가 올바르지 않다`);
    } else if (fixed && item.status !== fixed) {
      errors.push(
        fixed === 'manual'
          ? `${item.id}은 [manual]이므로 status가 manual이어야 한다`
          : `${item.id}은 CI 기준이므로 status가 ci여야 한다`
      );
    } else if (!fixed && ['manual', 'ci'].includes(item.status)) {
      errors.push(`${item.id}은 [manual]·CI 기준이 아닌데 status가 ${item.status}이다`);
    }
  }
  const missing = [...expected.keys()].filter((id) => !seen.has(id));
  if (missing.length > 0) {
    errors.push(`판정이 빠진 수용 기준: ${missing.join(', ')}`);
  }
  // 형식 오류가 있으면 판정 내용은 보지 않는다
  if (errors.length > 0) return { ok: false, review, errors };

  // manual은 사람이, ci는 ci 잡이 판정한다. 그 외 기준의 cannot_determine은 그대로 미충족이다
  const unmet = review.criteria.filter((item) => !['met', 'manual', 'ci'].includes(item.status));
  const consistentPass = unmet.length === 0 && review.blocking_issues.length === 0;
  if (review.verdict === 'pass' && !consistentPass) {
    errors.push('verdict는 pass인데 충족되지 않은 기준이나 차단 사유가 있다');
  }
  if (review.verdict === 'fail') {
    const reasons = [
      ...unmet.map((item) => `${item.id} ${item.status}`),
      ...review.blocking_issues.map((issue) => `${issue.category} ${issue.file}:${issue.line}`),
    ];
    errors.push(`리뷰 판정 fail${reasons.length > 0 ? `: ${reasons.join(', ')}` : ''}`);
  }
  return { ok: errors.length === 0, review, errors };
}

// 표 칸에 들어갈 텍스트 — HTML 해석·표 깨짐을 막는다
function cell(text) {
  return String(text ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '\\|');
}

export function summaryMarkdown({ ok, review, errors }) {
  const lines = [`### ${ok ? '✅' : '❌'} Claude 명세 대조 리뷰`];
  if (errors.length > 0) {
    lines.push('', ...errors.map((error) => `- ${cell(error)}`));
  }
  if (review?.summary) {
    lines.push('', cell(review.summary));
  }
  if (Array.isArray(review?.criteria) && review.criteria.length > 0) {
    lines.push('', '| 기준 | 상태 | 근거 |', '| --- | --- | --- |');
    for (const item of review.criteria) {
      lines.push(`| ${cell(item.id)} | ${cell(item.status)} | ${cell(item.evidence)} |`);
    }
  }
  if (Array.isArray(review?.blocking_issues) && review.blocking_issues.length > 0) {
    lines.push('', '| 분류 | 위치 | 내용 |', '| --- | --- | --- |');
    for (const issue of review.blocking_issues) {
      lines.push(
        `| ${cell(issue.category)} | ${cell(`${issue.file}:${issue.line}`)} | ${cell(issue.description)} |`
      );
    }
  }
  return lines.join('\n');
}

function parseArgs(argv, keys) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '');
    const value = argv[i + 1];
    if (!keys.includes(key) || value === undefined) {
      throw new Error(`알 수 없는 인자: ${argv[i]}`);
    }
    args[key] = value;
  }
  const missing = keys.filter((key) => !args[key]);
  if (missing.length > 0)
    throw new Error(`필요한 인자: ${missing.map((k) => `--${k}`).join(', ')}`);
  return args;
}

// 여러 줄 값은 heredoc 형식으로 쓴다. 구분자는 값에 나올 수 없게 무작위로 만든다
function writeMultilineOutput(key, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  const delimiter = `EOF_${randomBytes(16).toString('hex')}`;
  appendFileSync(process.env.GITHUB_OUTPUT, `${key}<<${delimiter}\n${value}\n${delimiter}\n`);
}

function preparePrompt(argv) {
  const args = parseArgs(argv, [
    'template',
    'schema',
    'out-dir',
    'spec-id',
    'spec-path',
    'spec-merge-sha',
    'base',
    'head',
  ]);
  const outDir = args['out-dir'];
  mkdirSync(outDir, { recursive: true });
  const diffPath = join(outDir, 'pr.diff').replace(/\\/g, '/');
  const filesPath = join(outDir, 'files.txt').replace(/\\/g, '/');
  const range = `${args.base}...${args.head}`;
  writeFileSync(
    diffPath,
    execFileSync('git', ['diff', '--no-renames', range], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
  );
  writeFileSync(
    filesPath,
    execFileSync('git', ['diff', '--name-status', '--no-renames', range], { encoding: 'utf8' })
  );

  // CI 기준 목록은 PR이 아니라 base의 명세에서 계산한다
  const specContent = readFileAt(args.base, args['spec-path']);
  if (specContent === null) throw new Error(`base에 ${args['spec-path']}이 없다`);

  const prompt = renderPrompt(readFileSync(args.template, 'utf8'), {
    SPEC_ID: args['spec-id'],
    SPEC_PATH: args['spec-path'],
    SPEC_MERGE_SHA: args['spec-merge-sha'],
    BASE_SHA: args.base,
    HEAD_SHA: args.head,
    DIFF_PATH: diffPath,
    FILES_PATH: filesPath,
    CI_CRITERIA: ciCriteriaLabel(parseSpec(specContent).criteria),
  });
  // claude_args 안에서 작은따옴표로 감싸므로 스키마에 작은따옴표가 있으면 안 된다
  const schema = JSON.stringify(JSON.parse(readFileSync(args.schema, 'utf8')));
  if (schema.includes("'")) throw new Error('리뷰 스키마에 작은따옴표가 있다');

  writeMultilineOutput('prompt', prompt);
  writeOutputs({ schema });
  console.log(prompt);
}

function verify(argv) {
  const args = parseArgs(argv, ['spec-path', 'spec-id', 'spec-merge-sha', 'base', 'head']);
  // 명세는 PR 작업 트리가 아니라 base 커밋에서 읽는다 (impl PR은 명세를 바꿀 수 없지만 한 번 더 막는다)
  const content = readFileAt(args.base, args['spec-path']);
  const criteria = content === null ? [] : parseSpec(content).criteria;
  const result =
    content === null
      ? { ok: false, review: null, errors: [`base에 ${args['spec-path']}이 없다`] }
      : verifyReview({
          output: process.env.STRUCTURED_OUTPUT,
          criteria,
          specId: args['spec-id'],
          specMergeSha: args['spec-merge-sha'],
          headSha: args.head,
        });
  const ciCriteria = ciCriteriaLabel(criteria);

  console.log(JSON.stringify({ ok: result.ok, errors: result.errors, ciCriteria }, null, 2));
  writeSummary(summaryMarkdown(result));
  // pr-gate가 CI 기준을 같은 head의 ci 잡 결과로 판정했음을 요약에 남긴다
  writeOutputs({ ok: result.ok, reason: joinReasons(result.errors), ci_criteria: ciCriteria });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [command, ...rest] = process.argv.slice(2);
  try {
    if (command === 'prompt') preparePrompt(rest);
    else if (command === 'verify') verify(rest);
    else throw new Error('사용법: review.mjs prompt|verify ...');
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}
