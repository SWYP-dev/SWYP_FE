// 이벤트 이름·속성은 docs/analytics/posthog-events.md와 일치시킨다.
import type { Platform } from '@/types/api';

export type AccountType = 'kakao' | 'test';
export type LoginTrigger = 'scrap' | 'notification_bell' | 'sidebar' | 'api_401';
export type LoginEntry = 'landing_navbar' | 'login_modal';
export type CardAddSource = 'feed_direct' | 'feed_scrapped' | 'scraps_page' | 'manual';

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
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
