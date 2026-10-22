// classify-pr 규칙 테스트 — `node --test "scripts/ai/*.test.mjs"` 로 실행 (pr-validation.yml의 classify 잡에서도 실행)
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { classifyPr, isPolicyPath, parseBranch } from './classify-pr.mjs';

test('브랜치명을 분류하고 메타데이터를 읽는다', () => {
  assert.deepEqual(parseBranch('spec/FEATURE-0001-r0'), {
    kind: 'spec',
    specId: 'FEATURE-0001',
    revision: 0,
  });
  assert.deepEqual(parseBranch('impl/QA-012-spec-61'), {
    kind: 'impl',
    specId: 'QA-012',
    specPr: 61,
  });
  for (const branch of [
    'feature/login',
    'fix/kanban-drag',
    'docs/claude-codex',
    'hotfix/x',
    'chore/ai-pr-validation',
  ]) {
    assert.deepEqual(parseBranch(branch), { kind: 'general' }, branch);
  }
});

test('예약 접두사인데 형식이 다르면 unknown', () => {
  for (const branch of [
    'spec/feature-0001-r0',
    'spec/FEATURE-0001-r01',
    'spec/FEATURE-0001',
    'impl/FEATURE-0001-spec-0',
    'impl/FEATURE-0001',
    'impl/',
  ]) {
    assert.equal(parseBranch(branch).kind, 'unknown', branch);
  }
});

test('정책 경로를 판별한다', () => {
  for (const path of [
    '.github/workflows/ci.yml',
    '.claude/rules/git-rules.md',
    '.codex/hooks.json',
    '.agents/skills/source-command-git-push/SKILL.md',
    'docs/ai/codex-prompt.template.md',
    'docs/workflow/claude-codex-plan.md',
    'scripts/ai/classify-pr.mjs',
    'AGENTS.md',
    'CLAUDE.md',
    'src/features/kanban/AGENTS.md',
  ]) {
    assert.equal(isPolicyPath(path), true, path);
  }
  for (const path of [
    'src/app/page.tsx',
    'docs/specs/FEATURE-0001.md',
    'src/features/kanban/api/kanbanApi.ts',
  ]) {
    assert.equal(isPolicyPath(path), false, path);
  }
});

test('spec PR: 명세 경로만 바꾸면 통과', () => {
  const result = classifyPr({
    branch: 'spec/FEATURE-0001-r0',
    files: ['docs/specs/FEATURE-0001.md', 'docs/specs/README.md'],
  });
  assert.equal(result.ok, true, result.errors.join());
});

test('spec PR: 코드가 섞이면 실패', () => {
  const result = classifyPr({
    branch: 'spec/FEATURE-0001-r0',
    files: ['docs/specs/FEATURE-0001.md', 'src/app/page.tsx'],
  });
  assert.equal(result.ok, false);
});

test('spec PR: 자기 명세 파일이 없으면 실패', () => {
  const result = classifyPr({
    branch: 'spec/FEATURE-0001-r1',
    files: ['docs/specs/FEATURE-0002.md'],
  });
  assert.equal(result.ok, false);
});

test('spec PR: revision 상한(2) 초과는 실패', () => {
  const result = classifyPr({
    branch: 'spec/FEATURE-0001-r3',
    files: ['docs/specs/FEATURE-0001.md'],
  });
  assert.equal(result.ok, false);
});

test('impl PR: 코드만 바꾸면 통과', () => {
  const result = classifyPr({
    branch: 'impl/FEATURE-0001-spec-60',
    files: ['src/app/page.tsx', 'src/features/kanban/components/KanbanBoard.tsx'],
  });
  assert.equal(result.ok, true, result.errors.join());
});

test('impl PR: 정책 경로가 섞이면 실패', () => {
  const result = classifyPr({
    branch: 'impl/FEATURE-0001-spec-60',
    files: ['src/app/page.tsx', '.github/workflows/ci.yml'],
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.policyFiles, ['.github/workflows/ci.yml']);
});

test('impl PR: 명세를 바꾸면 실패', () => {
  const result = classifyPr({
    branch: 'impl/FEATURE-0001-spec-60',
    files: ['src/app/page.tsx', 'docs/specs/FEATURE-0001.md'],
  });
  assert.equal(result.ok, false);
});

test('spec PR: 정책 경로가 섞이면 실패', () => {
  const result = classifyPr({
    branch: 'spec/FEATURE-0001-r0',
    files: ['docs/specs/FEATURE-0001.md', 'AGENTS.md'],
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('정책 경로')));
});

test('general PR: 코드·정책 경로·명세 모두 분류는 통과 (CI만 요구)', () => {
  const result = classifyPr({
    branch: 'feature/login',
    files: [
      'src/a.ts',
      '.github/workflows/ci.yml',
      'scripts/ai/classify-pr.mjs',
      'docs/specs/README.md',
    ],
  });
  assert.equal(result.ok, true, result.errors.join());
});

test('예약 접두사 형식 위반과 빈 변경은 실패', () => {
  assert.equal(classifyPr({ branch: 'impl/FEATURE-0001', files: ['src/a.ts'] }).ok, false);
  assert.equal(classifyPr({ branch: 'feature/empty', files: [] }).ok, false);
});
