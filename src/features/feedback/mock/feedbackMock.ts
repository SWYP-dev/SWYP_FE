import type { FeedbackSubmitPayload } from '../types/feedback';

// 수동 검증에서 실패 경로를 재현하기 위한 mock 전용 키워드다.
export const MOCK_FAIL_KEYWORD = 'mock-fail';

export async function mockUploadFeedbackImage(file: File): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  if (file.name.includes(MOCK_FAIL_KEYWORD)) {
    throw new Error('이미지 업로드 mock 실패');
  }
}

export async function mockSubmitFeedback(payload: FeedbackSubmitPayload): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  if (payload.content.includes(MOCK_FAIL_KEYWORD)) {
    throw new Error('의견 제출 mock 실패');
  }
}
