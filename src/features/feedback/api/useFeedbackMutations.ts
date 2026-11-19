import { useMutation } from '@tanstack/react-query';
import { submitFeedback } from './feedbackApi';

// POST /api/v1/feedback — 의견 제출
export function useSubmitFeedbackMutation() {
  return useMutation({ mutationFn: submitFeedback });
}
