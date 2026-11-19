export type FeedbackCategory = 'bug_report' | 'feature_suggestion' | 'service_inquiry' | 'other';

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug_report: '오류 제보',
  feature_suggestion: '기능 개선 제안',
  service_inquiry: '서비스 이용 문의',
  other: '기타',
};

export interface FeedbackSubmitPayload {
  category: FeedbackCategory;
  content: string;
  email: string | null;
  imageFileName: string | null;
}
