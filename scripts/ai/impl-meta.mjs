#!/usr/bin/env node
// 구현 PR 본문 메타데이터 대조 (docs/workflow/claude-codex-plan.md 6.2)
//
// create-impl-pr(Step 3)이 PR 본문에 아래 블록을 넣는다. 이 값은 신뢰 근거가 아니라 대조 대상이다.
//
//   <!-- impl-meta -->
//   ```json
//   { "spec_id": "...", "spec_path": "docs/specs/<spec_id>.md", "revision": 0,
//     "source_spec_pr": 456, "source_spec_merge_sha": "<40자리 SHA>", "feasibility": "ready" }
//   ```
//
// 대조: 브랜치명 ↔ 메타데이터, 명세 PR이 실제로 머지된 spec PR이고 merge SHA가 같은지,
//       merge SHA의 명세가 지금 develop(base)의 명세와 같은지(다르면 superseded).
//
// 사용법: node scripts/ai/impl-meta.mjs --branch <이름> --base <rev>
//   PR 본문은 환경변수 PR_BODY, 명세 PR 조회는 GITHUB_TOKEN·GITHUB_REPOSITORY(·GITHUB_API_URL)로 한다.
//   GITHUB_OUTPUT에 ok·reason·spec_path·spec_merge_sha를 쓴다. 인자·git·API 오류만 종료 코드 2.

import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { MAX_REVISION, SPEC_DIR, parseBranch, readFileAt } from './classify-pr.mjs';
import { joinReasons, writeOutputs } from './gh-output.mjs';
import { parseSpec, specHash } from './spec-file.mjs';

export const META_MARKER = '<!-- impl-meta -->';
const META_BLOCK = /<!-- impl-meta -->\s*```json\s*\n([\s\S]*?)\n\s*```/;
const SHA = /^[0-9a-f]{40}$/;
const META_KEYS = [
  'spec_id',
  'spec_path',
  'revision',
  'source_spec_pr',
  'source_spec_merge_sha',
  'feasibility',
];

// create-impl-pr이 같은 형식을 쓰도록 내보낸다
export function formatMeta(meta) {
  return `${META_MARKER}\n\`\`\`json\n${JSON.stringify(meta, null, 2)}\n\`\`\``;
}

export function parseMeta(body) {
  const text = (body ?? '').replace(/\r\n?/g, '\n');
  if (text.split(META_MARKER).length !== 2) {
    return { meta: null, error: `PR 본문에 ${META_MARKER} 블록이 정확히 하나 있어야 한다` };
  }
  const match = META_BLOCK.exec(text);
  if (!match) {
    return { meta: null, error: `${META_MARKER} 바로 뒤에 \`\`\`json 블록이 없다` };
  }
  try {
    const meta = JSON.parse(match[1]);
    if (meta === null || typeof meta !== 'object' || Array.isArray(meta)) {
      return { meta: null, error: '메타데이터가 JSON 객체가 아니다' };
    }
    return { meta, error: null };
  } catch (error) {
    return { meta: null, error: `메타데이터 JSON을 읽을 수 없다: ${error.message}` };
  }
}

// 순수 대조. specPr: GitHub API의 PR 객체(없으면 null), readSpec(rev): 해당 커밋의 명세 내용(없으면 null),
// isAncestor(rev): rev가 base의 조상인지
export function checkImplMeta({ branch, meta, specPr, readSpec, baseSha, isAncestor }) {
  const parsed = parseBranch(branch);
  const errors = [];
  if (parsed.kind !== 'impl') {
    return { ok: false, errors: [`impl 브랜치가 아니다: ${branch}`] };
  }

  const missing = META_KEYS.filter((key) => !(key in meta));
  if (missing.length > 0) {
    return { ok: false, errors: [`메타데이터에 ${missing.join(', ')}가 없다`] };
  }
  const extra = Object.keys(meta).filter((key) => !META_KEYS.includes(key));
  if (extra.length > 0) {
    errors.push(`알 수 없는 메타데이터 키: ${extra.join(', ')}`);
  }

  const { spec_id: specId, spec_path: specPath, revision, feasibility } = meta;
  const prNumber = meta.source_spec_pr;
  const mergeSha = meta.source_spec_merge_sha;

  if (specId !== parsed.specId) {
    errors.push(`spec_id '${specId}'이 브랜치의 '${parsed.specId}'와 다르다`);
  }
  if (prNumber !== parsed.specPr) {
    errors.push(`source_spec_pr ${prNumber}이 브랜치의 ${parsed.specPr}과 다르다`);
  }
  if (specPath !== `${SPEC_DIR}${parsed.specId}.md`) {
    errors.push(`spec_path '${specPath}'는 ${SPEC_DIR}${parsed.specId}.md여야 한다`);
  }
  if (!Number.isInteger(revision) || revision < 0 || revision > MAX_REVISION) {
    errors.push(`revision ${JSON.stringify(revision)}은 0~${MAX_REVISION} 정수여야 한다`);
  }
  if (feasibility !== 'ready') {
    errors.push(`feasibility '${feasibility}'는 ready여야 한다`);
  }
  if (typeof mergeSha !== 'string' || !SHA.test(mergeSha)) {
    errors.push('source_spec_merge_sha가 40자리 SHA가 아니다');
  }
  // 형식이 틀리면 아래 조회 결과도 의미가 없다
  if (errors.length > 0) return { ok: false, errors };

  if (!specPr) {
    return { ok: false, errors: [`명세 PR #${prNumber}을 찾을 수 없다`] };
  }
  if (!specPr.merged_at) {
    errors.push(`명세 PR #${prNumber}은 머지되지 않았다`);
  }
  if (specPr.base?.ref !== 'develop') {
    errors.push(`명세 PR #${prNumber}의 base가 develop이 아니다 (${specPr.base?.ref})`);
  }
  const expectedHead = `spec/${specId}-r${revision}`;
  if (specPr.head?.ref !== expectedHead) {
    errors.push(`명세 PR #${prNumber}의 브랜치 '${specPr.head?.ref}'가 ${expectedHead}가 아니다`);
  }
  if (specPr.merge_commit_sha !== mergeSha) {
    errors.push(`명세 PR #${prNumber}의 merge SHA가 메타데이터와 다르다`);
  }
  if (errors.length > 0) return { ok: false, errors };

  if (!isAncestor(mergeSha)) {
    return {
      ok: false,
      errors: [`merge SHA ${mergeSha.slice(0, 7)}가 base(develop)의 이력에 없다`],
    };
  }

  const mergedContent = readSpec(mergeSha);
  if (mergedContent === null) {
    return { ok: false, errors: [`merge SHA ${mergeSha.slice(0, 7)}에 ${specPath}이 없다`] };
  }
  const merged = parseSpec(mergedContent, { specId, revision });
  if (merged.errors.length > 0) {
    errors.push(...merged.errors.map((error) => `머지된 명세: ${error}`));
  }

  const currentContent = readSpec(baseSha);
  if (currentContent === null) {
    errors.push(`base(develop)에 ${specPath}이 없다 — 경로 이동·삭제는 사람이 판단한다`);
  } else if (specHash(currentContent) !== specHash(mergedContent)) {
    const current = parseSpec(currentContent);
    errors.push(
      `superseded: develop의 ${specPath}(revision ${current.revision})이 이 구현의 기준 명세(revision ${revision})와 다르다`
    );
  }

  return { ok: errors.length === 0, errors };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!['--branch', '--base'].includes(key) || value === undefined) {
      throw new Error(`알 수 없는 인자: ${key}`);
    }
    args[key.slice(2)] = value;
  }
  for (const key of ['branch', 'base']) {
    if (!args[key]) throw new Error(`--${key}가 필요하다`);
  }
  return args;
}

async function fetchPull(number) {
  const { GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env;
  const apiUrl = process.env.GITHUB_API_URL ?? 'https://api.github.com';
  if (!GITHUB_TOKEN || !GITHUB_REPOSITORY) {
    throw new Error('GITHUB_TOKEN·GITHUB_REPOSITORY가 필요하다');
  }
  const response = await fetch(`${apiUrl}/repos/${GITHUB_REPOSITORY}/pulls/${number}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${GITHUB_TOKEN}`,
      'x-github-api-version': '2022-11-28',
    },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`명세 PR 조회 실패: HTTP ${response.status}`);
  }
  return response.json();
}

function isAncestorOf(base) {
  return (rev) => {
    try {
      execFileSync('git', ['merge-base', '--is-ancestor', rev, base], { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  };
}

async function main() {
  const { branch, base } = parseArgs(process.argv.slice(2));
  const { meta, error } = parseMeta(process.env.PR_BODY);
  let result;

  if (!meta) {
    result = { ok: false, errors: [error] };
  } else {
    const specPr =
      Number.isInteger(meta.source_spec_pr) && meta.source_spec_pr > 0
        ? await fetchPull(meta.source_spec_pr)
        : null;
    result = checkImplMeta({
      branch,
      meta,
      specPr,
      readSpec: (rev) => readFileAt(rev, `${SPEC_DIR}${parseBranch(branch).specId}.md`),
      baseSha: base,
      isAncestor: isAncestorOf(base),
    });
  }

  console.log(JSON.stringify({ ...result, meta }, null, 2));
  writeOutputs({
    ok: result.ok,
    reason: joinReasons(result.errors),
    spec_path: result.ok ? meta.spec_path : '',
    spec_merge_sha: result.ok ? meta.source_spec_merge_sha : '',
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(2);
  });
}
