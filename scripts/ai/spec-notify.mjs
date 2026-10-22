#!/usr/bin/env node
// 명세 머지 알림: 머지된 spec PR에 Codex용 프롬프트 코멘트를 게시·갱신한다 (docs/workflow/claude-codex-plan.md 6.4 · 8.2)
//
// 사용법 (spec-merged-notify.yml이 실행. 템플릿은 작업 트리, 명세는 merge SHA에서 읽는다):
//   node scripts/ai/spec-notify.mjs --branch <spec/ID-rN> --pr <번호> --merge-sha <sha> [--dry-run]
//   GitHub 호출은 GITHUB_TOKEN·GITHUB_REPOSITORY(·GITHUB_API_URL)로 한다. --dry-run이면 코멘트 본문만 출력한다.
//
// 코멘트에는 검증한 값(명세 ID·경로·PR 번호·merge SHA·revision)만 넣는다. PR 제목·본문은 쓰지 않는다.
// 숨은 마커로 기존 코멘트를 찾아 갱신하므로 워크플로우를 다시 실행해도 코멘트가 늘지 않는다.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { SPEC_DIR, parseBranch, readFileAt } from './classify-pr.mjs';
import { parseSpec } from './spec-file.mjs';

const SHA = /^[0-9a-f]{40}$/;
export const TEMPLATE_PATH = 'docs/ai/codex-prompt.template.md';

export function commentMarker(specId, revision) {
  return `<!-- codex-prompt:${specId}:r${revision} -->`;
}

export function renderCodexPrompt(template, values) {
  const checks = {
    SPEC_ID: (v) => /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/.test(v),
    SPEC_PATH: (v) => new RegExp(`^${SPEC_DIR}[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+\\.md$`).test(v),
    SPEC_PR: (v) => /^[1-9][0-9]*$/.test(v),
    MERGE_SHA: (v) => SHA.test(v),
    REVISION: (v) => /^(0|[1-9][0-9]*)$/.test(v),
  };
  for (const [key, check] of Object.entries(checks)) {
    if (typeof values[key] !== 'string' || !check(values[key])) {
      throw new Error(`프롬프트 값 ${key}의 형식이 올바르지 않다: ${values[key]}`);
    }
  }
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (whole, key) => {
    if (!(key in checks)) throw new Error(`알 수 없는 템플릿 변수: ${whole}`);
    return values[key];
  });
}

// 머지된 spec PR 정보와 머지 커밋의 명세 내용으로 코멘트 본문을 만든다
export function buildComment({ branch, prNumber, mergeSha, specContent, template }) {
  const parsed = parseBranch(branch);
  if (parsed.kind !== 'spec') {
    throw new Error(`spec 브랜치가 아니다: ${branch}`);
  }
  const { specId, revision } = parsed;
  const specPath = `${SPEC_DIR}${specId}.md`;
  if (specContent === null) {
    throw new Error(`머지 커밋에 ${specPath}이 없다`);
  }
  const spec = parseSpec(specContent, { specId, revision });
  if (spec.errors.length > 0) {
    throw new Error(`명세 형식 오류: ${spec.errors.join(' / ')}`);
  }

  const prompt = renderCodexPrompt(template, {
    SPEC_ID: specId,
    SPEC_PATH: specPath,
    SPEC_PR: String(prNumber),
    MERGE_SHA: mergeSha,
    REVISION: String(revision),
  });
  const manual = spec.criteria.filter((item) => item.manual).map((item) => item.id);
  const body = [
    commentMarker(specId, revision),
    `### 🤖 Codex 구현 프롬프트 — ${specId} r${revision}`,
    '',
    '1. 공유 작업 폴더에서 `git status`가 깨끗한지 확인하고 `git switch develop` → `git pull --ff-only`',
    '2. Cursor의 Codex 패널에서 새 스레드를 열고 (모델 `gpt-6.1-sol` · medium, 승인 처리는 사용자 직접) 아래 블록 전체를 붙여넣기',
    '3. Codex가 `create-impl-pr`을 실행하려고 승인을 요청하면 내용을 보고 승인. PR의 `pr-gate` 결과를 확인한 뒤 직접 머지',
    '',
    `수용 기준 ${spec.criteria.length}개${manual.length > 0 ? ` (직접 확인: ${manual.join(', ')})` : ''}`,
    '',
    '````text',
    prompt.trimEnd(),
    '````',
  ].join('\n');
  return { specId, revision, marker: commentMarker(specId, revision), body };
}

async function github(method, path, payload) {
  const { GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env;
  const apiUrl = process.env.GITHUB_API_URL ?? 'https://api.github.com';
  if (!GITHUB_TOKEN || !GITHUB_REPOSITORY) {
    throw new Error('GITHUB_TOKEN·GITHUB_REPOSITORY가 필요하다');
  }
  const response = await fetch(`${apiUrl}/repos/${GITHUB_REPOSITORY}${path}`, {
    method,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${GITHUB_TOKEN}`,
      'x-github-api-version': '2022-11-28',
      ...(payload ? { 'content-type': 'application/json' } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${method} ${path} 실패: HTTP ${response.status}`);
  }
  return response.json();
}

// 마커가 있는 기존 코멘트를 찾아 갱신하고, 없으면 새로 만든다
async function upsertComment(prNumber, marker, body) {
  for (let page = 1; page <= 10; page += 1) {
    const comments = await github('GET', `/issues/${prNumber}/comments?per_page=100&page=${page}`);
    const existing = comments.find((comment) => comment.body?.startsWith(marker));
    if (existing) {
      await github('PATCH', `/issues/comments/${existing.id}`, { body });
      return { action: 'updated', url: existing.html_url };
    }
    if (comments.length < 100) break;
  }
  const created = await github('POST', `/issues/${prNumber}/comments`, { body });
  return { action: 'created', url: created.html_url };
}

function parseArgs(argv) {
  const args = { 'dry-run': false };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i]?.replace(/^--/, '');
    if (key === 'dry-run') {
      args[key] = true;
      continue;
    }
    if (!['branch', 'pr', 'merge-sha'].includes(key) || argv[i + 1] === undefined) {
      throw new Error(`알 수 없는 인자: ${argv[i]}`);
    }
    args[key] = argv[i + 1];
    i += 1;
  }
  for (const key of ['branch', 'pr', 'merge-sha']) {
    if (!args[key]) throw new Error(`--${key}가 필요하다`);
  }
  if (!/^[1-9][0-9]*$/.test(args.pr)) throw new Error(`PR 번호가 올바르지 않다: ${args.pr}`);
  if (!SHA.test(args['merge-sha']))
    throw new Error(`merge SHA가 올바르지 않다: ${args['merge-sha']}`);
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const parsed = parseBranch(args.branch);
  const comment = buildComment({
    branch: args.branch,
    prNumber: Number(args.pr),
    mergeSha: args['merge-sha'],
    specContent:
      parsed.kind === 'spec'
        ? readFileAt(args['merge-sha'], `${SPEC_DIR}${parsed.specId}.md`)
        : null,
    template: readFileSync(TEMPLATE_PATH, 'utf8'),
  });

  if (args['dry-run']) {
    console.log(comment.body);
    return;
  }
  const result = await upsertComment(Number(args.pr), comment.marker, comment.body);
  console.log(`코멘트 ${result.action === 'created' ? '게시' : '갱신'}: ${result.url}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
