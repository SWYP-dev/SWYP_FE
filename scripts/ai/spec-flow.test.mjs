// 명세 머지 알림·구현 PR 생성 테스트 — `node --test "scripts/ai/*.test.mjs"` 로 실행
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { buildImplMeta, composeBody } from './create-impl-pr.mjs';
import { parseMeta } from './impl-meta.mjs';
import { parseSpec } from './spec-file.mjs';
import { buildComment, commentMarker, renderCodexPrompt } from './spec-notify.mjs';

const MERGE_SHA = 'a'.repeat(40);
const TEMPLATE = readFileSync(
  new URL('../../docs/ai/codex-prompt.template.md', import.meta.url),
  'utf8'
);
const spec = (revision) =>
  `---\nspec_id: FEATURE-0001\nrevision: ${revision}\n---\n- AC-01 기준\n- AC-02 [manual] 화면\n`;

test('실제 Codex 프롬프트 템플릿의 변수를 모두 채운다', () => {
  const prompt = renderCodexPrompt(TEMPLATE, {
    SPEC_ID: 'FEATURE-0001',
    SPEC_PATH: 'docs/specs/FEATURE-0001.md',
    SPEC_PR: '63',
    MERGE_SHA,
    REVISION: '0',
  });
  assert.ok(!prompt.includes('{{'));
  assert.ok(prompt.includes('impl/FEATURE-0001-spec-63'));
});

test('프롬프트에 형식이 틀린 값은 넣지 않는다', () => {
  const values = {
    SPEC_ID: 'FEATURE-0001',
    SPEC_PATH: 'docs/specs/FEATURE-0001.md',
    SPEC_PR: '63',
    MERGE_SHA,
    REVISION: '0',
  };
  assert.throws(() => renderCodexPrompt(TEMPLATE, { ...values, SPEC_PR: '63; rm' }));
  assert.throws(() => renderCodexPrompt(TEMPLATE, { ...values, SPEC_PATH: '../x.md' }));
  assert.throws(() => renderCodexPrompt('{{TITLE}}', values));
});

test('머지된 spec PR 코멘트: 마커·manual 기준·프롬프트 포함', () => {
  const comment = buildComment({
    branch: 'spec/FEATURE-0001-r1',
    prNumber: 70,
    mergeSha: MERGE_SHA,
    specContent: spec(1),
    template: TEMPLATE,
  });
  assert.equal(comment.marker, commentMarker('FEATURE-0001', 1));
  assert.ok(comment.body.startsWith('<!-- codex-prompt:FEATURE-0001:r1 -->'));
  assert.ok(comment.body.includes('직접 확인: AC-02'));
  assert.ok(comment.body.includes('impl/FEATURE-0001-spec-70'));
});

test('코멘트: spec 브랜치가 아니거나 명세가 없거나 형식이 틀리면 거부', () => {
  const base = { prNumber: 70, mergeSha: MERGE_SHA, template: TEMPLATE };
  assert.throws(() => buildComment({ ...base, branch: 'feature/x', specContent: spec(0) }));
  assert.throws(() => buildComment({ ...base, branch: 'spec/FEATURE-0001-r0', specContent: null }));
  assert.throws(() =>
    buildComment({ ...base, branch: 'spec/FEATURE-0001-r1', specContent: spec(0) })
  );
});

test('실제 명세 템플릿은 placeholder를 채우면 형식 검사를 통과한다', () => {
  const raw = readFileSync(new URL('../../docs/ai/spec-template.md', import.meta.url), 'utf8');
  const filled = raw.replaceAll('<SPEC_ID>', 'FEATURE-0001');
  const result = parseSpec(filled, { specId: 'FEATURE-0001', revision: 0 });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(
    result.criteria.map((item) => item.manual),
    [false, false, true]
  );
});

test('구현 PR 메타데이터는 spec PR 브랜치에서 revision을 읽는다', () => {
  const meta = buildImplMeta('impl/FEATURE-0001-spec-70', {
    head: { ref: 'spec/FEATURE-0001-r1' },
    merge_commit_sha: MERGE_SHA,
  });
  assert.deepEqual(meta, {
    spec_id: 'FEATURE-0001',
    spec_path: 'docs/specs/FEATURE-0001.md',
    revision: 1,
    source_spec_pr: 70,
    source_spec_merge_sha: MERGE_SHA,
    feasibility: 'ready',
  });
  assert.throws(() => buildImplMeta('feature/x', { head: { ref: 'spec/FEATURE-0001-r1' } }));
  assert.throws(() => buildImplMeta('impl/FEATURE-0001-spec-70', { head: { ref: 'feature/x' } }));
});

test('구현 PR 본문에 메타데이터를 붙이고, CI 파서가 다시 읽을 수 있다', () => {
  const meta = buildImplMeta('impl/FEATURE-0001-spec-70', {
    head: { ref: 'spec/FEATURE-0001-r0' },
    merge_commit_sha: MERGE_SHA,
  });
  const body = composeBody('## 개요\n\n구현했다\n', meta);
  assert.deepEqual(parseMeta(body).meta, meta);
  assert.throws(() => composeBody(body, meta));
  assert.throws(() => composeBody('  \n', meta));
});
