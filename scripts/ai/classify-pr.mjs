#!/usr/bin/env node
// PR 분류 규칙 (docs/workflow/claude-codex-plan.md 10.3)
//
// spec/·impl/는 파이프라인 예약 접두사다. 그 외 브랜치(feature/·fix/·docs/ 등 기존 관행)는 general로 분류해 CI만 요구한다.
// 예약 접두사는 브랜치명만 믿지 않고 실제 변경 경로와 함께 대조한다.
// CI(pr-validation.yml의 classify 잡)와 로컬(create-impl-pr, Step 3)이 이 모듈 하나를 같이 쓴다 — 규칙이 두 벌이 되지 않게 하기 위함.
//
// 사용법 (CLI):
//   node scripts/ai/classify-pr.mjs [--branch <이름>] [--base <rev>] [--head <rev>]
//   기본값: 현재 브랜치, origin/develop, HEAD. 결과는 JSON으로 출력하고, GITHUB_OUTPUT이 있으면 kind·ok·reason과 브랜치 메타데이터(spec_id·revision·spec_pr)를 쓴다.
//   분류 실패도 종료 코드 0으로 끝낸다(판정은 pr-gate가 한다). 인자·git 오류만 종료 코드 2.

import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { joinReasons, writeOutputs } from './gh-output.mjs';

export const SPEC_DIR = 'docs/specs/';

// 정책 경로: 리뷰 기준·자동화·에이전트 규칙. 바뀌면 검증 자체가 바뀌므로 spec/·impl/ PR에서는 막고,
// 일반 브랜치(general) PR에서 사람이 직접 검토해 머지한다
const POLICY_PREFIXES = [
  '.github/',
  '.claude/',
  '.codex/',
  '.agents/', // Codex 스킬 (커밋·push 절차 등)
  'docs/ai/',
  'docs/workflow/',
  'scripts/ai/',
];
// 에이전트 진입점은 하위 폴더에도 있다 (예: src/features/kanban/AGENTS.md를 추가해도 정책 경로)
const POLICY_BASENAMES = ['AGENTS.md', 'CLAUDE.md'];

// 명세 ID: 대문자로 시작하고 하이픈으로 이어지는 대문자·숫자 묶음 (예: FEATURE-0001, QA-012)
export const SPEC_ID = '[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+';
// 단위 명세 파일 (frontmatter 검사 대상). 그 외 docs/specs/ 파일(PRD 등)은 관련 문서
export const UNIT_SPEC_PATH = new RegExp(`^docs/specs/(${SPEC_ID})\\.md$`);
const SPEC_BRANCH = new RegExp(`^spec/(${SPEC_ID})-r(0|[1-9][0-9]*)$`);
const IMPL_BRANCH = new RegExp(`^impl/(${SPEC_ID})-spec-([1-9][0-9]*)$`);
const RESERVED_PREFIX = /^(?:spec|impl)\//;

// 서로 다른 명세 회차는 최대 3개 (revision 0·1·2)
export const MAX_REVISION = 2;

export function isPolicyPath(path) {
  const basename = path.split('/').pop();
  return (
    POLICY_PREFIXES.some((prefix) => path.startsWith(prefix)) || POLICY_BASENAMES.includes(basename)
  );
}

export function isSpecPath(path) {
  return path.startsWith(SPEC_DIR);
}

// 브랜치명만으로 분류와 메타데이터를 읽는다. 예약 접두사인데 형식이 틀리면 unknown, 예약 접두사가 아니면 general
export function parseBranch(branch) {
  let match = SPEC_BRANCH.exec(branch);
  if (match) {
    return { kind: 'spec', specId: match[1], revision: Number(match[2]) };
  }
  match = IMPL_BRANCH.exec(branch);
  if (match) {
    return { kind: 'impl', specId: match[1], specPr: Number(match[2]) };
  }
  if (RESERVED_PREFIX.test(branch)) {
    return { kind: 'unknown' };
  }
  return { kind: 'general' };
}

// 브랜치와 변경 파일 목록으로 분류하고 규칙 위반을 모은다
export function classifyPr({ branch, files }) {
  const parsed = parseBranch(branch);
  const errors = [];

  if (files.length === 0) {
    errors.push('변경된 파일이 없다');
  }

  const policyFiles = files.filter(isPolicyPath);

  if (parsed.kind === 'unknown') {
    errors.push(
      `브랜치명 '${branch}'이 예약 접두사 형식(spec/<ID>-r<N> · impl/<ID>-spec-<PR번호>)이 아니다 — 파이프라인 밖 작업이면 spec/·impl/이 아닌 접두사를 쓴다`
    );
  }

  if (parsed.kind === 'spec') {
    if (parsed.revision > MAX_REVISION) {
      errors.push(`revision ${parsed.revision}은 상한 ${MAX_REVISION}을 넘는다`);
    }
    if (policyFiles.length > 0) {
      errors.push(
        `spec PR은 정책 경로를 바꿀 수 없다(일반 브랜치로 분리): ${policyFiles.join(', ')}`
      );
    }
    const outside = files.filter((file) => !isSpecPath(file) && !isPolicyPath(file));
    if (outside.length > 0) {
      errors.push(`spec PR은 ${SPEC_DIR} 밖을 바꿀 수 없다: ${outside.join(', ')}`);
    }
    const specFile = `${SPEC_DIR}${parsed.specId}.md`;
    if (!files.includes(specFile)) {
      errors.push(`명세 파일 ${specFile}이 변경 목록에 없다`);
    }
  }

  if (parsed.kind === 'impl') {
    if (policyFiles.length > 0) {
      errors.push(
        `impl PR은 정책 경로를 바꿀 수 없다(일반 브랜치로 분리): ${policyFiles.join(', ')}`
      );
    }
    const specFiles = files.filter(isSpecPath);
    if (specFiles.length > 0) {
      errors.push(`impl PR은 명세를 바꿀 수 없다(spec/ PR로 분리): ${specFiles.join(', ')}`);
    }
  }

  return { ...parsed, branch, ok: errors.length === 0, errors, files, policyFiles };
}

// base...head 사이의 변경 파일. 이름 변경은 삭제+추가로 펼쳐서 옮겨 나간 경로도 검사한다
export function changedFiles(base, head) {
  const output = execFileSync('git', ['diff', '--name-only', '--no-renames', `${base}...${head}`], {
    encoding: 'utf8',
  });
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

// 특정 커밋의 파일 내용. 파일이 없으면 null
export function readFileAt(rev, path) {
  try {
    return execFileSync('git', ['show', `${rev}:${path}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function currentBranch() {
  return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim();
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
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const branch = args.branch ?? currentBranch();
  const files = changedFiles(args.base ?? 'origin/develop', args.head ?? 'HEAD');
  const result = classifyPr({ branch, files });

  console.log(JSON.stringify(result, null, 2));

  writeOutputs({
    kind: result.kind,
    ok: result.ok,
    reason: joinReasons(result.errors),
    spec_id: result.specId ?? '',
    revision: result.revision ?? '',
    spec_pr: result.specPr ?? '',
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}
