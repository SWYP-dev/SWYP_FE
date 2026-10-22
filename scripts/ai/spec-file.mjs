// 단위 명세 파일(docs/specs/<SPEC_ID>.md) 해석 (docs/workflow/claude-codex-plan.md 6.1)
//
// 형식:
//   ---
//   spec_id: FEATURE-0001
//   revision: 0
//   ---
//   ...
//   - AC-01 <수용 기준>
//   - AC-02 [manual] <사람이 직접 확인하는 수용 기준>
//
// 수용 기준은 목록 기호·체크박스·제목 기호·표 칸·굵게(**) 바로 뒤에 AC-<두 자리 이상 숫자>로 정의한다.
// 그 외 위치(문장 맨 앞 "AC-04는 ..." 포함)에 나오는 AC-xx는 참조로 보고 정의로 세지 않는다.
//
// CI 기준: 문장 전체가 "(루트에서) <CI가 실행하는 명령들>이 통과한다" 한 가지뿐인 기준이다.
//   예) - AC-03 `npm run typecheck`·`npm run build`가 통과한다
// 이 저장소는 단일 앱이라 범위는 루트뿐이다. 테스트 러너가 없어 `npm test`는 CI 기준이 될 수 없다.
// 같은 head의 ci 잡이 실제로 실행해 판정하므로, 읽기 전용 Claude 리뷰는 판정하지 않는다(status "ci").
// 형식이 조금이라도 다르거나(다른 주장이 섞임) CI가 실행하지 않는 명령이 있으면 일반 기준으로 남는다.

import { createHash } from 'node:crypto';

const FRONTMATTER = /^---\n([\s\S]*?)\n---(?:\n|$)/;
const REVISION_VALUE = /^(0|[1-9][0-9]*)$/;
// 정의: "- AC-01", "- [ ] AC-01", "### AC-01", "**AC-01**", "| AC-01 |" 등. 접두 기호가 반드시 있어야 하고,
// ID 바로 뒤는 공백·줄 끝·표 구분자·굵게·콜론·마침표만 허용한다 ("AC-01는"처럼 조사가 붙으면 참조)
const AC_DEFINITION =
  /^[ \t]*(?:#{1,6}[ \t]+\**|[-*+][ \t]+(?:\[[ xX]\][ \t]+)?\**|\|[ \t]*\**|\*\*)(AC-[0-9]{2,})(?=[ \t*|:.]|$)(.*)$/gm;

// .github/workflows/ci.yml의 필수 잡 npm 명령 (범위 → 명령). ci.yml을 바꾸면 함께 고친다 — spec-check.test.mjs가 대조한다
// continue-on-error 잡은 게이트를 막지 않으므로 넣지 않는다 (지금은 해당 잡 없음)
export const CI_COMMANDS = {
  root: ['npm run typecheck', 'npm run build', 'npm run lint'],
};
const CI_CRITERION =
  /^\s*(?:루트\s*(?:에서|폴더에서)?\s*)?((?:`npm (?:run [a-z:-]+|test)`\s*(?:[·,]|와|과)?\s*)+)(?:이|가)?\s*(?:모두\s*)?통과한다\.?\s*$/;

// 기준 본문(ID 뒤)이 CI 기준 형식이고, 적힌 명령을 CI 필수 잡이 모두 실행하는지
export function isCiCriterion(text) {
  // ID 뒤에 붙을 수 있는 굵게·콜론·표 구분자는 형식 판단에서 뺀다
  const match = CI_CRITERION.exec(text.replace(/^[\s*:|]+/, '').replace(/[\s|]+$/, ''));
  if (!match) return false;
  const scope = 'root';
  const commands = [...match[1].matchAll(/`(npm (?:run [a-z:-]+|test))`/g)].map((m) => m[1]);
  return commands.length > 0 && commands.every((command) => CI_COMMANDS[scope].includes(command));
}

function normalize(content) {
  return content.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
}

// frontmatter의 key: value 한 줄짜리 값만 읽는다 (중첩 YAML은 쓰지 않는다)
export function parseFrontmatter(content) {
  const match = FRONTMATTER.exec(normalize(content));
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split('\n')) {
    const pair = /^([A-Za-z_][A-Za-z0-9_]*):[ \t]*(.*?)[ \t]*$/.exec(line);
    if (pair) {
      fields[pair[1]] = pair[2].replace(/^(["'])(.*)\1$/, '$2');
    }
  }
  return fields;
}

// 수용 기준 정의 목록: [{ id, manual, ci }]. [manual]이면 ci가 될 수 없다
export function parseCriteria(content) {
  const criteria = [];
  for (const match of normalize(content).matchAll(AC_DEFINITION)) {
    const manual = /\[manual\]/i.test(match[2]);
    criteria.push({ id: match[1], manual, ci: !manual && isCiCriterion(match[2]) });
  }
  return criteria;
}

// 명세 파일을 해석하고 형식 오류를 모은다. expected를 주면 spec_id·revision이 같은지도 본다
export function parseSpec(content, expected = {}) {
  const errors = [];
  const fields = parseFrontmatter(content);
  let specId = null;
  let revision = null;

  if (!fields) {
    errors.push('frontmatter(--- ... ---)가 파일 맨 앞에 없다');
  } else {
    specId = fields.spec_id ?? null;
    if (!specId) {
      errors.push('frontmatter에 spec_id가 없다');
    }
    if (fields.revision === undefined) {
      errors.push('frontmatter에 revision이 없다');
    } else if (!REVISION_VALUE.test(fields.revision)) {
      errors.push(`revision '${fields.revision}'이 0 이상의 정수가 아니다`);
    } else {
      revision = Number(fields.revision);
    }
  }

  if (expected.specId !== undefined && specId !== null && specId !== expected.specId) {
    errors.push(`spec_id '${specId}'이 '${expected.specId}'와 다르다`);
  }
  if (expected.revision !== undefined && revision !== null && revision !== expected.revision) {
    errors.push(`revision ${revision}이 ${expected.revision}과 다르다`);
  }

  const criteria = parseCriteria(content);
  if (criteria.length === 0) {
    errors.push('수용 기준(AC-xx)이 하나도 없다');
  }
  const seen = new Set();
  for (const { id } of criteria) {
    if (seen.has(id)) errors.push(`수용 기준 ${id}이 두 번 이상 정의됐다`);
    seen.add(id);
  }

  return { specId, revision, criteria, errors };
}

// 줄바꿈 차이(CRLF/LF)에 영향받지 않는 내용 해시
export function specHash(content) {
  return createHash('sha256').update(normalize(content)).digest('hex');
}
