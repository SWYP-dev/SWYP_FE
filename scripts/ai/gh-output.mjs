// GitHub Actions 출력·요약 쓰기 도우미. 로컬 실행(GITHUB_OUTPUT 없음)에서는 아무것도 하지 않는다
import { appendFileSync } from 'node:fs';

// 값은 한 줄로 만든다 — 줄바꿈이 들어가면 key=value 형식이 깨진다
export function writeOutputs(values) {
  if (!process.env.GITHUB_OUTPUT) return;
  const lines = Object.entries(values).map(
    ([key, value]) => `${key}=${String(value ?? '').replace(/[\r\n]+/g, ' ')}`
  );
  appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
}

export function writeSummary(markdown) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

// 실패 사유 목록을 출력용 한 줄로 합친다
export function joinReasons(errors) {
  return errors.join(' / ');
}
