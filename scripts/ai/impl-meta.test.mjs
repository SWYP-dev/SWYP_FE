// 구현 PR 메타데이터 대조 테스트 — `node --test "scripts/ai/*.test.mjs"` 로 실행
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkImplMeta, formatMeta, parseMeta } from './impl-meta.mjs';

const MERGE_SHA = 'a'.repeat(40);
const BASE_SHA = 'b'.repeat(40);
const specAt = (revision) =>
  `---\nspec_id: FEATURE-0001\nrevision: ${revision}\n---\n- AC-01 기준\n`;

const meta = (overrides = {}) => ({
  spec_id: 'FEATURE-0001',
  spec_path: 'docs/specs/FEATURE-0001.md',
  revision: 0,
  source_spec_pr: 60,
  source_spec_merge_sha: MERGE_SHA,
  feasibility: 'ready',
  ...overrides,
});

const specPr = (overrides = {}) => ({
  merged_at: '2026-10-20T00:00:00Z',
  merge_commit_sha: MERGE_SHA,
  base: { ref: 'develop' },
  head: { ref: 'spec/FEATURE-0001-r0' },
  ...overrides,
});

// develop(base)의 명세가 머지 시점과 같은 기본 상황
const check = ({ m = meta(), pr = specPr(), current = specAt(0), ancestor = true, branch } = {}) =>
  checkImplMeta({
    branch: branch ?? 'impl/FEATURE-0001-spec-60',
    meta: m,
    specPr: pr,
    readSpec: (rev) => (rev === MERGE_SHA ? specAt(0) : current),
    baseSha: BASE_SHA,
    isAncestor: () => ancestor,
  });

test('본문 메타데이터 블록을 만들고 다시 읽는다', () => {
  const body = `## 개요\n\n구현\n\n${formatMeta(meta())}\n`;
  assert.deepEqual(parseMeta(body), { meta: meta(), error: null });
  assert.deepEqual(parseMeta(body.replace(/\n/g, '\r\n')).meta, meta());
});

test('메타데이터 블록이 없거나 둘이거나 깨지면 오류', () => {
  assert.ok(parseMeta('본문만').error);
  assert.ok(parseMeta(`${formatMeta(meta())}\n${formatMeta(meta())}`).error);
  assert.ok(parseMeta('<!-- impl-meta -->\n```json\n{ 깨짐\n```').error);
  assert.ok(parseMeta('<!-- impl-meta -->\n```json\n[1]\n```').error);
});

test('정상 메타데이터는 통과', () => {
  const result = check();
  assert.equal(result.ok, true, result.errors.join());
});

test('브랜치명과 메타데이터가 다르면 실패', () => {
  assert.equal(check({ m: meta({ spec_id: 'FEATURE-0002' }) }).ok, false);
  assert.equal(check({ m: meta({ source_spec_pr: 61 }) }).ok, false);
  assert.equal(check({ m: meta({ spec_path: 'docs/specs/other.md' }) }).ok, false);
  assert.equal(check({ branch: 'feature/x' }).ok, false);
});

test('메타데이터 형식 오류는 실패', () => {
  assert.equal(check({ m: meta({ revision: 3 }) }).ok, false);
  assert.equal(check({ m: meta({ revision: '0' }) }).ok, false);
  assert.equal(check({ m: meta({ feasibility: 'needs_human' }) }).ok, false);
  assert.equal(check({ m: meta({ source_spec_merge_sha: 'abc' }) }).ok, false);
  assert.equal(check({ m: meta({ extra: 1 }) }).ok, false);
  const { feasibility, ...partial } = meta();
  assert.equal(check({ m: partial }).ok, false, feasibility);
});

test('명세 PR이 머지되지 않았거나 다른 PR이면 실패', () => {
  assert.equal(check({ pr: null }).ok, false);
  assert.equal(check({ pr: specPr({ merged_at: null }) }).ok, false);
  assert.equal(check({ pr: specPr({ base: { ref: 'main' } }) }).ok, false);
  assert.equal(check({ pr: specPr({ head: { ref: 'feature/x' } }) }).ok, false);
  assert.equal(check({ pr: specPr({ merge_commit_sha: 'c'.repeat(40) }) }).ok, false);
  assert.equal(check({ ancestor: false }).ok, false);
});

test('develop의 명세가 바뀌었으면 superseded로 실패', () => {
  const result = check({ current: specAt(1) });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.startsWith('superseded')));
  assert.equal(check({ current: null }).ok, false);
});
