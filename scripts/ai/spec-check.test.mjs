// 명세 해석·spec PR 형식 검사 테스트 — `node --test "scripts/ai/*.test.mjs"` 로 실행
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { checkSpecPr } from './spec-check.mjs';
import { CI_COMMANDS, isCiCriterion, parseCriteria, parseSpec, specHash } from './spec-file.mjs';

const spec = (revision, body = '- AC-01 첫 기준\n- AC-02 [manual] 화면 확인\n') =>
  `---\nspec_id: FEATURE-0001\nrevision: ${revision}\n---\n\n# 명세\n\n${body}`;

test('수용 기준 정의를 읽고 [manual]을 구분한다', () => {
  const content = [
    '- AC-01 목록',
    '- [ ] AC-02 체크박스',
    '### AC-03 [manual] 제목',
    '| AC-04 | 표 |',
    '**AC-05** 굵게',
    '본문에서 AC-01을 참조하는 문장은 정의가 아니다',
    'AC-03는 문장 맨 앞의 참조라 정의가 아니다',
    'AC-04 접두 기호 없는 줄도 정의가 아니다',
    '- AC-06는 조사가 붙으면 참조다',
    '- **AC-07**: 굵게와 콜론',
  ].join('\n');
  assert.deepEqual(parseCriteria(content), [
    { id: 'AC-01', manual: false, ci: false },
    { id: 'AC-02', manual: false, ci: false },
    { id: 'AC-03', manual: true, ci: false },
    { id: 'AC-04', manual: false, ci: false },
    { id: 'AC-05', manual: false, ci: false },
    { id: 'AC-07', manual: false, ci: false },
  ]);
});

test('정상 명세는 오류가 없고 CRLF도 같게 읽는다', () => {
  const result = parseSpec(spec(1), { specId: 'FEATURE-0001', revision: 1 });
  assert.deepEqual(result.errors, []);
  assert.equal(result.revision, 1);
  const crlf = spec(1).replace(/\n/g, '\r\n');
  assert.deepEqual(parseSpec(crlf).errors, []);
  assert.equal(specHash(crlf), specHash(spec(1)));
});

test('frontmatter·수용 기준 오류를 잡는다', () => {
  assert.ok(parseSpec('# 제목\n- AC-01 a').errors.length > 0);
  assert.ok(
    parseSpec('---\nspec_id: X-1\n---\n- AC-01 a').errors.some((e) => e.includes('revision'))
  );
  assert.ok(parseSpec('---\nspec_id: X-1\nrevision: 01\n---\n- AC-01 a').errors.length > 0);
  assert.ok(parseSpec(spec(0, '기준 없음')).errors.some((e) => e.includes('AC-xx')));
  assert.ok(parseSpec(spec(0, '- AC-01 a\n- AC-01 b')).errors.some((e) => e.includes('두 번')));
  assert.ok(parseSpec(spec(0), { specId: 'FEATURE-0002' }).errors.length > 0);
});

test('spec PR: 최초 명세는 revision 0', () => {
  const files = ['docs/specs/FEATURE-0001.md'];
  assert.equal(
    checkSpecPr({ branch: 'spec/FEATURE-0001-r0', files, headContent: spec(0), baseContent: null })
      .ok,
    true
  );
  assert.equal(
    checkSpecPr({ branch: 'spec/FEATURE-0001-r1', files, headContent: spec(1), baseContent: null })
      .ok,
    false
  );
});

test('spec PR: 보완은 develop의 revision + 1', () => {
  const files = ['docs/specs/FEATURE-0001.md'];
  const check = (branch, revision) =>
    checkSpecPr({ branch, files, headContent: spec(revision), baseContent: spec(0) }).ok;
  assert.equal(check('spec/FEATURE-0001-r1', 1), true);
  assert.equal(check('spec/FEATURE-0001-r0', 0), false);
  assert.equal(check('spec/FEATURE-0001-r2', 2), false);
});

test('spec PR: frontmatter와 브랜치가 다르면 실패', () => {
  const result = checkSpecPr({
    branch: 'spec/FEATURE-0001-r1',
    files: ['docs/specs/FEATURE-0001.md'],
    headContent: spec(2),
    baseContent: spec(0),
  });
  assert.equal(result.ok, false);
});

test('spec PR: 다른 단위 명세를 함께 바꾸면 실패, 관련 문서는 허용', () => {
  const base = { branch: 'spec/FEATURE-0001-r0', headContent: spec(0), baseContent: null };
  assert.equal(
    checkSpecPr({
      ...base,
      files: ['docs/specs/FEATURE-0001.md', 'docs/specs/prd-construction.md'],
    }).ok,
    true
  );
  assert.equal(
    checkSpecPr({ ...base, files: ['docs/specs/FEATURE-0001.md', 'docs/specs/FEATURE-0002.md'] })
      .ok,
    false
  );
});

test('spec PR: 명세 파일 삭제는 실패', () => {
  const result = checkSpecPr({
    branch: 'spec/FEATURE-0001-r1',
    files: ['docs/specs/FEATURE-0001.md'],
    headContent: null,
    baseContent: spec(0),
  });
  assert.equal(result.ok, false);
});

test('CI 기준: CI 필수 잡이 실행하는 명령만 있는 문장', () => {
  const yes = [
    ' `npm run typecheck`·`npm run build`가 통과한다',
    ' 루트에서 `npm run build`, `npm run typecheck`가 모두 통과한다.',
    ' `npm run typecheck`가 통과한다',
    '** `npm run build`가 통과한다',
    ' `npm run lint`가 통과한다', // LINT-0001 이후 lint도 CI 필수 잡이다
    ' `npm run typecheck`·`npm run build`·`npm run lint`가 통과한다',
  ];
  for (const text of yes) assert.equal(isCiCriterion(text), true, text);

  const no = [
    ' `npm run format:check`가 통과한다', // CI가 실행하지 않는 명령
    ' `npm test`가 통과한다', // 테스트 러너 없음
    ' `npx tsc --noEmit`가 성공한다',
    ' `npm run build`가 통과하고 칸반 보드가 표시된다', // 다른 주장이 섞임
    ' `apps/api`에서 `npm run build`가 통과한다', // 이 저장소에 없는 범위
    ' 저장하면 목록이 갱신된다',
    ' [manual] `npm run build`가 통과한다',
  ];
  for (const text of no) assert.equal(isCiCriterion(text), false, text);
});

test('CI 기준은 [manual]과 겹치지 않고 parseCriteria가 표시한다', () => {
  const criteria = parseCriteria(
    [
      '- AC-01 `npm run build`가 통과한다',
      '- AC-02 [manual] `npm run build`가 통과한다',
      '- AC-03 화면에 표시된다',
    ].join('\n')
  );
  assert.deepEqual(criteria, [
    { id: 'AC-01', manual: false, ci: true },
    { id: 'AC-02', manual: true, ci: false },
    { id: 'AC-03', manual: false, ci: false },
  ]);
});

test('CI_COMMANDS가 ci.yml 필수 잡의 npm 명령과 일치한다', () => {
  const yml = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
  const actual = { root: [] };
  // jobs 아래 잡 블록(들여쓰기 2칸 키)마다 npm 실행 명령을 모은다.
  // continue-on-error 잡은 실패해도 게이트를 막지 않으므로 CI 기준 판정 근거가 될 수 없어 제외한다
  const jobs = yml
    .slice(yml.indexOf('\njobs:'))
    .split(/\n {2}(?=[a-z][a-z0-9_-]*:\s*\n)/)
    .slice(1);
  for (const job of jobs) {
    if (/^ {4}continue-on-error:\s*true\s*$/m.test(job)) continue;
    for (const match of job.matchAll(/run:\s*(npm (?:run [a-z:-]+|test))\s*$/gm)) {
      actual.root.push(match[1]);
    }
  }
  assert.deepEqual(Object.keys(CI_COMMANDS), ['root']);
  assert.deepEqual([...actual.root].sort(), [...CI_COMMANDS.root].sort());
});

test('명세 예시: CI 기준과 manual 기준을 구분한다', () => {
  const content = spec(
    0,
    [
      '## 수용 기준',
      '',
      '- AC-01 루트의 `tatus` 파일이 삭제된다',
      '- AC-02 다른 파일은 바뀌지 않는다',
      '- AC-03 `npm run typecheck`·`npm run build`가 통과한다',
      '- AC-04 [manual] Vercel 프리뷰 또는 로컬 `npm run dev`에서 랜딩 페이지가 정상 표시된다',
      '',
      'AC-03는 CI가 판정한다.',
    ].join('\n')
  );
  const criteria = parseCriteria(content);
  assert.deepEqual(
    criteria.map((item) => item.id),
    ['AC-01', 'AC-02', 'AC-03', 'AC-04']
  );
  assert.deepEqual(
    criteria.filter((item) => item.ci).map((item) => item.id),
    ['AC-03']
  );
  assert.deepEqual(
    criteria.filter((item) => item.manual).map((item) => item.id),
    ['AC-04']
  );
});
