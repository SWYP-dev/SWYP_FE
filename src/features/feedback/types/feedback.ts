export type FeedbackType = 'BUG_REPORT' | 'FEATURE_SUGGESTION' | 'SERVICE_INQUIRY' | 'ETC';

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  BUG_REPORT: '오류 제보',
  FEATURE_SUGGESTION: '기능 개선 제안',
  SERVICE_INQUIRY: '서비스 이용 문의',
  ETC: '기타',
};

export interface FeedbackCreateRequest {
  type: FeedbackType;
  content: string;
  email: string | null;
  image: File | null;
}

export interface FeedbackCreateResponse {
  feedbackId: number;
}
