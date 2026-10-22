#!/usr/bin/env node
// 구현 PR 생성 (docs/workflow/claude-codex-plan.md 9.3)
//
// Codex가 구현·커밋을 마친 뒤 실행한다. push와 GitHub 호출이 있으므로 Codex 샌드박스 밖 실행 승인(사용자)이 필요하다.
//   node scripts/ai/create-impl-pr.mjs --title "<이모지> <타입>: <요약>" --body-file .ai-tmp/impl-pr-body.md [--dry-run]
//
// PR을 만들기 전에 CI와 같은 규칙으로 검사하고, 하나라도 어긋나면 push하지 않고 멈춘다.
//   - 현재 브랜치가 impl/<SPEC_ID>-spec-<PR번호>, 작업 트리가 깨끗함
//   - 변경 경로가 classify 규칙 통과 (정책 경로·명세 변경 없음)
//   - <PR번호>가 머지된 spec PR이고, 그 명세가 지금 develop의 명세와 같음 (impl-meta 대조)
// 통과하면 본문에 메타데이터 블록을 붙여 push → 같은 브랜치의 열린 PR이 있으면 갱신, 없으면 생성(base develop, 라벨 impl).
// 머지는 하지 않는다. develop·main으로 push하지 않는다.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { SPEC_DIR, changedFiles, classifyPr, parseBranch, readFileAt } from './classify-pr.mjs';
import { META_MARKER, checkImplMeta, formatMeta } from './impl-meta.mjs';

const BASE = 'develop';

// 머지된 spec PR 정보로 메타데이터를 만든다. revision은 spec PR의 브랜치명에서 읽는다
export function buildImplMeta(branch, specPr) {
  const impl = parseBranch(branch);
  const spec = parseBranch(specPr?.head?.ref ?? '');
  if (impl.kind !== 'impl') throw new Error(`impl 브랜치가 아니다: ${branch}`);
  if (spec.kind !== 'spec') {
    throw new Error(
      `명세 PR #${impl.specPr}의 브랜치 '${specPr?.head?.ref}'가 spec/ 형식이 아니다`
    );
  }
  return {
    spec_id: impl.specId,
    spec_path: `${SPEC_DIR}${impl.specId}.md`,
    revision: spec.revision,
    source_spec_pr: impl.specPr,
    source_spec_merge_sha: specPr.merge_commit_sha,
    feasibility: 'ready',
  };
}

export function composeBody(body, meta) {
  if (body.includes(META_MARKER)) {
    throw new Error(`본문에 ${META_MARKER} 블록을 직접 쓰지 않는다 (스크립트가 붙인다)`);
  }
  if (!body.trim()) throw new Error('PR 본문이 비어 있다');
  return `${body.trimEnd()}\n\n## 메타데이터\n\n${formatMeta(meta)}\n\n🤖 Codex가 \`scripts/ai/create-impl-pr.mjs\`로 생성\n`;
}

function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: 'utf8', ...options }).trim();
}

function parseArgs(argv) {
  const args = { 'dry-run': false };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i]?.replace(/^--/, '');
    if (key === 'dry-run') {
      args[key] = true;
      continue;
    }
    if (!['title', 'body-file'].includes(key) || argv[i + 1] === undefined) {
      throw new Error(`알 수 없는 인자: ${argv[i]}`);
    }
    args[key] = argv[i + 1];
    i += 1;
  }
  if (!args.title?.trim() || /[\r\n]/.test(args.title))
    throw new Error('--title은 한 줄로 필요하다');
  if (!args['body-file']) throw new Error('--body-file이 필요하다');
  return args;
}

function fail(errors) {
  console.error('PR을 만들지 않았다:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  const parsed = parseBranch(branch);
  if (parsed.kind !== 'impl') {
    fail([`현재 브랜치 '${branch}'가 impl/<SPEC_ID>-spec-<PR번호> 형식이 아니다`]);
  }
  const dirty = run('git', ['status', '--porcelain']);
  if (dirty) fail([`커밋되지 않은 변경이 있다:\n${dirty}`]);

  console.log(`실행 신원: ${run('gh', ['api', 'user', '--jq', '.login'])}`);
  run('git', ['fetch', 'origin', BASE], { stdio: ['ignore', 'pipe', 'inherit'] });
  const base = `origin/${BASE}`;

  const classified = classifyPr({ branch, files: changedFiles(base, 'HEAD') });
  if (!classified.ok) fail(classified.errors);

  const specPr = JSON.parse(run('gh', ['api', `repos/{owner}/{repo}/pulls/${parsed.specPr}`]));
  const meta = buildImplMeta(branch, specPr);
  const checked = checkImplMeta({
    branch,
    meta,
    specPr,
    readSpec: (rev) => readFileAt(rev, meta.spec_path),
    baseSha: base,
    isAncestor: (rev) => {
      try {
        execFileSync('git', ['merge-base', '--is-ancestor', rev, base], { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    },
  });
  if (!checked.ok) fail(checked.errors);

  const body = composeBody(readFileSync(args['body-file'], 'utf8'), meta);
  const bodyPath = join(mkdtempSync(join(tmpdir(), 'impl-pr-')), 'body.md');
  writeFileSync(bodyPath, body);

  console.log(`브랜치: ${branch} (변경 파일 ${classified.files.length}개)`);
  console.log(`명세: ${meta.spec_path} r${meta.revision} (PR #${meta.source_spec_pr})`);
  if (args['dry-run']) {
    console.log('\n--dry-run: push·PR 생성 없이 본문만 출력한다\n');
    console.log(body);
    return;
  }

  // force 없이 브랜치 이름 그대로 push한다 (develop·main은 위 브랜치 검사에서 걸러진다)
  run('git', ['push', '-u', 'origin', `${branch}:refs/heads/${branch}`], {
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  const open = JSON.parse(
    run('gh', [
      'pr',
      'list',
      '--head',
      branch,
      '--base',
      BASE,
      '--state',
      'open',
      '--json',
      'number,url',
    ])
  );
  if (open.length > 0) {
    run('gh', [
      'pr',
      'edit',
      String(open[0].number),
      '--title',
      args.title,
      '--body-file',
      bodyPath,
    ]);
    console.log(`기존 PR 갱신: ${open[0].url}`);
    return;
  }
  const url = run('gh', [
    'pr',
    'create',
    '--base',
    BASE,
    '--head',
    branch,
    '--title',
    args.title,
    '--body-file',
    bodyPath,
    '--label',
    'impl',
  ]);
  console.log(`PR 생성: ${url}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}
