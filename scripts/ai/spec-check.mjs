#!/usr/bin/env node
// spec PR 형식 검사 (docs/workflow/claude-codex-plan.md 5.1 · 10.2)
//
// classify가 spec으로 분류하고 경로 규칙을 통과한 PR에만 실행한다. 검사:
//   - 자기 명세 파일의 frontmatter(spec_id·revision)가 브랜치명과 같고 수용 기준(AC-xx)이 있음
//   - revision이 develop에 있는 같은 명세의 revision +1 (develop에 없으면 0)
//   - 다른 단위 명세 파일을 함께 바꾸지 않음 (한 PR에 명세 하나)
//
// 사용법: node scripts/ai/spec-check.mjs --branch <이름> --base <rev> --head <rev>
// 결과는 JSON으로 출력하고 GITHUB_OUTPUT에 ok·reason을 쓴다. 인자·git 오류만 종료 코드 2.

import { pathToFileURL } from 'node:url';

import { SPEC_DIR, UNIT_SPEC_PATH, changedFiles, parseBranch, readFileAt } from './classify-pr.mjs';
import { joinReasons, writeOutputs } from './gh-output.mjs';
import { parseSpec } from './spec-file.mjs';

// headContent: PR 쪽 명세 내용, baseContent: develop 쪽 명세 내용(없으면 null)
export function checkSpecPr({ branch, files, headContent, baseContent }) {
  const parsed = parseBranch(branch);
  if (parsed.kind !== 'spec') {
    return { ok: false, errors: [`spec 브랜치가 아니다: ${branch}`] };
  }
  const { specId, revision } = parsed;
  const errors = [];
  const specPath = `${SPEC_DIR}${specId}.md`;

  const otherSpecs = files.filter((file) => {
    const match = UNIT_SPEC_PATH.exec(file);
    return match && match[1] !== specId;
  });
  if (otherSpecs.length > 0) {
    errors.push(`다른 단위 명세를 함께 바꿀 수 없다: ${otherSpecs.join(', ')}`);
  }

  if (headContent === null) {
    errors.push(`${specPath}이 PR에서 삭제됐다`);
    return { ok: false, specId, revision, errors };
  }

  const head = parseSpec(headContent, { specId, revision });
  errors.push(...head.errors.map((error) => `${specPath}: ${error}`));

  if (baseContent === null) {
    if (revision !== 0) {
      errors.push(`develop에 ${specPath}이 없으므로 revision은 0이어야 한다 (브랜치 r${revision})`);
    }
  } else {
    const base = parseSpec(baseContent);
    if (base.revision === null) {
      errors.push(`develop의 ${specPath}에서 revision을 읽을 수 없다`);
    } else if (revision !== base.revision + 1) {
      errors.push(
        `revision은 develop의 ${base.revision} + 1 = ${base.revision + 1}이어야 한다 (브랜치 r${revision})`
      );
    }
  }

  return { ok: errors.length === 0, specId, revision, criteria: head.criteria, errors };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!['--branch', '--base', '--head'].includes(key) || value === undefined) {
      throw new Error(`알 수 없는 인자: ${key}`);
    }
    args[key.slice(2)] = value;
  }
  for (const key of ['branch', 'base', 'head']) {
    if (!args[key]) throw new Error(`--${key}가 필요하다`);
  }
  return args;
}

function main() {
  const { branch, base, head } = parseArgs(process.argv.slice(2));
  const parsed = parseBranch(branch);
  const specPath = parsed.kind === 'spec' ? `${SPEC_DIR}${parsed.specId}.md` : null;
  const result = checkSpecPr({
    branch,
    files: changedFiles(base, head),
    headContent: specPath ? readFileAt(head, specPath) : null,
    baseContent: specPath ? readFileAt(base, specPath) : null,
  });

  console.log(JSON.stringify(result, null, 2));
  writeOutputs({ ok: result.ok, reason: joinReasons(result.errors) });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}
