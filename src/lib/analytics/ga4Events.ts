// GA4(GTM dataLayer)로 보내는 이벤트 이름·속성 목록.
// 노션 「GA4 이벤트 설계」 문서와 일치시킨다. 이름·속성을 바꿀 때는 노션을 먼저 고친다.
// pushDataLayerEvent(src/lib/gtm.ts)가 이 목록을 기준으로 이벤트 이름·속성을 검사한다.
// PostHog와 같은 행동은 이름·속성을 맞춰 두 도구 수치를 비교할 수 있게 한다.

import type { AnalyticsEventMap } from './events';

export type LoginEntry = 'landing_navbar' | 'login_modal';
export type FeedFilterType = 'job_category' | 'region' | 'career' | 'deadline_soon';

// 결과가 0건일 때만 그 시점에 적용된 필터 조건 전체를 필터별로 나눠 보낸다(값 100자 제한 대비).
// 결과가 있으면 이전 push 값이 남지 않도록 모두 undefined로 비운다.
type FeedFilterZeroResult =
  | {
      has_result: 'true';
      zero_result_job_category: undefined;
      zero_result_region: undefined;
      zero_result_career: undefined;
      zero_result_deadline_soon: undefined;
    }
  | {
      has_result: 'false';
      zero_result_job_category: string;
      zero_result_region: string;
      zero_result_career: string;
      zero_result_deadline_soon: 'on' | 'off';
    };

export interface Ga4EventMap {
  // 비로그인 상태로 랜딩(/) 진입
  landing_viewed: Record<string, never>;
  // 랜딩의 회원가입/시작하기 CTA 클릭.
  landing_cta_clicked: {
    cta_type: 'start_free' | 'signup_login' | 'test_start'; // 비 로그인, 회원가입, 테스트 유저
    // navbar : 맨 위 고정 헤더, hero: 헤더 아래 큰 제목 영역의 가운데 버튼
    cta_location: 'navbar' | 'hero';
  };
  // 신규 계정 생성. 카카오 로그인 성공 중 신규 가입(isNewUser)일 때만 보낸다.
  // 로그인과 구분하려고 GA4 권장 이벤트 이름(sign_up)을 쓴다.
  sign_up: { method: 'kakao'; entry?: LoginEntry };

  // 회원 탈퇴
  account_deleted: Record<string, never>;

  // 통합 공고 탐색(/jobs) 화면 표시. 진입 경로와 관계없이 화면이 그려질 때 1회 보낸다.
  // 비로그인 둘러보기와 회원 방문을 나눠 보려고 로그인 여부를 함께 보낸다.
  job_feed_viewed: { is_logged_in: boolean };
  // 검색 실행 후 결과가 표시된 순간. 검색어는 결과가 0건일 때만 보낸다.
  // GTM dataLayer는 이전 push 값을 기억하므로 결과가 있을 때는 검색어를 undefined로 비운다.
  feed_searched:
    | { has_result: 'true'; zero_result_keyword: undefined }
    | { has_result: 'false'; zero_result_keyword: string };
  // 직군·직무 / 지역 / 경력 필터 적용 또는 마감일 임박 토글 후 결과가 갱신된 순간.
  // filter_value는 방금 바꾼 필터의 적용값(해제면 'all', 마감일 임박은 'on'/'off')이다.
  // 초기화 버튼은 제외한다. is_searching은 검색어 때문에 0건이 된 경우를 걸러내는 용도다.
  feed_filter_applied: {
    filter_type: FeedFilterType;
    filter_value: string;
    is_searching: 'true' | 'false';
  } & FeedFilterZeroResult;

  // 아래는 PostHog 이벤트와 이름·속성·발송 시점을 그대로 맞춘다. 속성 타입도 events.ts를 참조해
  // 두 도구 정의가 어긋나지 않게 한다. 통합 공고 탐색·스크랩 화면에서 보내는 형태로만 제한한다.
  // 스크랩·해제 API 성공 후
  job_scrapped: AnalyticsEventMap['job_scrapped'];
  scrap_removed: AnalyticsEventMap['scrap_removed'];
  // 원본 공고 이동 버튼 클릭. 칸반 화면 source는 platform이 없어 GTM에 이전 값이 남을 수 있으므로 아직 제외한다.
  original_posting_clicked: Extract<
    AnalyticsEventMap['original_posting_clicked'],
    { source: 'feed' | 'scraps' }
  >;
  // 지원 현황 추가 API 성공 후 / 이미 등록된 공고라는 응답을 받았을 때
  kanban_card_added: Extract<
    AnalyticsEventMap['kanban_card_added'],
    { source: 'feed_direct' | 'feed_scrapped' | 'scraps_page' }
  >;
  kanban_card_add_duplicated: AnalyticsEventMap['kanban_card_add_duplicated'];
  // 정렬을 실제로 바꾼 클릭 (같은 정렬 재클릭·최초 기본값 제외)
  feed_sort_changed: AnalyticsEventMap['feed_sort_changed'];
  // 지원 현황 추가 토스트의 '지원 현황 이동' 클릭
  toast_kanban_link_clicked: AnalyticsEventMap['toast_kanban_link_clicked'];

  // 스크랩 목록 화면 표시. PostHog에 기준 이벤트가 없어 GA4에서만 보낸다.
  // 로그인 사용자 전용 화면이라 로그인 확인 후 1회만 보낸다.
  scrap_list_viewed: Record<string, never>;

  // 전형 단계 이름 수정 진입. GA4 전용 이벤트 (PostHog에는 없음)
  stage_name_edit_trigger: { method: 'button' | 'double_click' };
}

export type Ga4EventName = keyof Ga4EventMap;
