import type { DefaultStageName, StageType } from '@/lib/analytics/events';
import type { KanbanStage } from '@/types/api';

export const DEFAULT_STAGE_NAMES: DefaultStageName[] = ['지원 전', '면접', '최종 결과'];

export function getStageType(stage: Pick<KanbanStage, 'isDefault' | 'name'>): StageType {
  // 서버가 일부 기본 단계의 isDefault를 false로 내려줘도 UI와 같은 기준으로 집계한다.
  return stage.isDefault || DEFAULT_STAGE_NAMES.some((name) => name === stage.name)
    ? 'default'
    : 'custom';
}

export function getStageAnalyticsName(
  stage: Pick<KanbanStage, 'name'>
): DefaultStageName | 'custom' {
  // 사용자 입력인 커스텀 단계 이름은 이벤트 속성으로 보내지 않는다.
  return DEFAULT_STAGE_NAMES.find((name) => name === stage.name) ?? 'custom';
}
