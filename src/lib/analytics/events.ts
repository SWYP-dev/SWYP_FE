// 이벤트 이름·속성은 docs/analytics/posthog-events.md와 일치시킨다.
import type { Platform } from '@/types/api';

export type AccountType = 'kakao' | 'test';
export type LoginTrigger = 'scrap' | 'notification_bell' | 'sidebar' | 'api_401';
export type LoginEntry = 'landing_navbar' | 'login_modal';
export type CardAddSource = 'feed_direct' | 'feed_scrapped' | 'scraps_page' | 'manual';
export type DefaultStageName = '지원 전' | '면접' | '최종 결과';
export type StageType = 'default' | 'custom';
export type CardDetailSource = 'kanban' | 'deadlines';
export type LinkCategory = 'RESUME' | 'PORTFOLIO' | 'PERSONAL_CHANNEL' | 'OTHER';

export interface AnalyticsEventMap {
  landing_viewed: Record<string, never>;
  landing_cta_clicked: {
    cta_type: 'start_free' | 'signup_login';
    cta_location: 'navbar' | 'hero';
  };
  login_prompt_shown: { trigger: LoginTrigger };
  kakao_login_started:
    { entry: 'landing_navbar' } | { entry: 'login_modal'; trigger: LoginTrigger };
  kakao_login_completed: { is_new_user: boolean; entry?: LoginEntry; trigger?: LoginTrigger };
  kakao_login_failed: { reason: 'kakao_denied' | 'server_error' };
  job_scrapped: {
    feed_id: number;
    platform: Platform;
    job_category: string | null;
    career: string;
    has_active_filter: boolean;
    is_searching: boolean;
  };
  scrap_removed: { source: 'feed' | 'scraps_page' };
  kanban_card_added:
    | {
        source: 'feed_direct' | 'feed_scrapped' | 'scraps_page';
        platform: Platform | null;
        job_category: string | null;
      }
    | { source: 'manual'; target_stage_type: 'default' | 'custom' };
  kanban_card_add_duplicated: { source: CardAddSource };
  original_posting_clicked:
    | { source: 'feed' | 'scraps'; platform: Platform | null }
    | { source: 'kanban_card' | 'card_drawer' };
  kanban_card_opened: { source: 'kanban' | 'deadlines' | 'email_deeplink' };
  card_detail_saved: {
    memo_changed: boolean;
    files_added: number;
    links_added: number;
    link_categories_changed: number;
    documents_deleted: number;
    link_categories_added: LinkCategory[];
    source: CardDetailSource;
  };
  card_detail_save_failed: { error_code: 'STORAGE_LIMIT_EXCEEDED' | 'unknown' };
  card_detail_discarded: Record<string, never>;
  kanban_card_stage_changed: {
    method: 'drag' | 'deadline_edit_modal';
    from_stage_type: StageType;
    to_stage_type: StageType;
    from_stage_name: DefaultStageName | 'custom';
    to_stage_name: DefaultStageName | 'custom';
    from_position: number;
    to_position: number;
    stage_count: number;
  };
  kanban_card_deleted: { source: CardDetailSource };
  kanban_card_delete_undone: Record<string, never>;
  kanban_stage_added: { stage_count_after: number };
  kanban_stage_add_blocked: { reason: 'limit_reached' };
  kanban_stage_reordered: {
    stage_type: StageType;
    from_position: number;
    to_position: number;
    stage_count: number;
  };
  kanban_stage_deleted: { stage_count_after: number };
  kanban_stage_delete_blocked: { card_count: number };
  kanban_stage_delete_undone: Record<string, never>;
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
