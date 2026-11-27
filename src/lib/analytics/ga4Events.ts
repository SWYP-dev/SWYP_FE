// GA4(GTM dataLayer)로 보내는 이벤트 이름·속성 목록.
// 노션 「GA4 이벤트 설계」 문서와 일치시킨다. 이름·속성을 바꿀 때는 노션을 먼저 고친다.
// pushDataLayerEvent(src/lib/gtm.ts)가 이 목록을 기준으로 이벤트 이름·속성을 검사한다.
// PostHog와 같은 행동은 이름·속성을 맞춰 두 도구 수치를 비교할 수 있게 한다.

import type { AnalyticsEventMap, CardDetailSource } from './events';

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
  // 원본 공고 이동 버튼 클릭. GTM dataLayer는 이전 push 값을 기억하므로, 값이 없는 매개변수도
  // undefined로 명시해 다른 화면의 platform이 섞이지 않게 한다.
  // 카드 상세 드로어(card_drawer)는 지원 현황·지원 마감일 화면이 함께 쓴다.
  // 칸반 카드 자체의 바로가기(kanban_card)는 노션 설계 범위 밖이라 PostHog로만 보낸다.
  // screen은 드로어가 열린 화면(지원 현황 kanban / 지원 마감일 deadlines)이며 드로어에서만 보낸다.
  original_posting_clicked:
    | (Extract<AnalyticsEventMap['original_posting_clicked'], { source: 'feed' | 'scraps' }> & {
        screen: undefined;
      })
    | { source: 'card_drawer'; platform: undefined; screen: CardDetailSource };
  // 지원 현황 추가 API 성공 후. 이미 등록된 공고 응답(kanban_card_add_duplicated)은
  // 노션 설계 범위 밖이라 PostHog로만 보낸다. 직접 등록(manual)은 외부 링크 공고 등록이다.
  // 경로별로 없는 매개변수는 undefined로 비워 이전 push 값이 남지 않게 한다.
  kanban_card_added:
    | (Extract<
        AnalyticsEventMap['kanban_card_added'],
        { source: 'feed_direct' | 'feed_scrapped' | 'scraps_page' }
      > & { target_stage_type: undefined })
    | (Extract<AnalyticsEventMap['kanban_card_added'], { source: 'manual' }> & {
        platform: undefined;
        job_category: undefined;
      });
  // 정렬을 실제로 바꾼 클릭 (같은 정렬 재클릭·최초 기본값 제외)
  feed_sort_changed: AnalyticsEventMap['feed_sort_changed'];
  // 지원 현황 추가 토스트의 '지원 현황 이동' 클릭
  toast_kanban_link_clicked: AnalyticsEventMap['toast_kanban_link_clicked'];

  // 스크랩 목록 화면 표시. PostHog에 기준 이벤트가 없어 GA4에서만 보낸다.
  // 로그인 사용자 전용 화면이라 로그인 확인 후 1회만 보낸다.
  scrap_list_viewed: Record<string, never>;

  // 전형 단계 이름 수정 진입. GA4 전용 이벤트 (PostHog에는 없음)
  stage_name_edit_trigger: { method: 'button' | 'double_click' };

  // 지원 현황 관리(칸반). 아래 이벤트는 PostHog와 이름·속성·발송 시점을 맞춘다.
  // 카드를 드래그해 다른 전형 단계로 옮기고 서버에 반영된 순간 (같은 단계 안 정렬·실패 제외).
  // 지원 마감일 화면의 수정 모달 경로(deadline_edit_modal)는 노션 설계 범위 밖이라 PostHog로만 보낸다.
  kanban_card_stage_changed: Omit<AnalyticsEventMap['kanban_card_stage_changed'], 'method'> & {
    method: 'drag';
  };
  // 사용자 정의 전형 단계 추가 저장 성공
  kanban_stage_added: AnalyticsEventMap['kanban_stage_added'];
  // 전형 단계 삭제 성공
  kanban_stage_deleted: AnalyticsEventMap['kanban_stage_deleted'];
  // 전형 단계를 드래그해 순서 변경 성공 (같은 위치로 놓은 경우 제외)
  kanban_stage_reordered: AnalyticsEventMap['kanban_stage_reordered'];
  // 전형 단계 최대 개수(10개)에 걸려 추가가 막힌 순간
  kanban_stage_add_blocked: AnalyticsEventMap['kanban_stage_add_blocked'];
  // 공고 카드 상세 드로어 열기. 지원 현황(kanban)·지원 마감일(deadlines)·메일 딥링크 진입을 source로 나눈다.
  kanban_card_opened: AnalyticsEventMap['kanban_card_opened'];

  // 아래는 PostHog에 기준 이벤트가 없어 GA4에서만 보낸다.
  // 지원 현황 화면 표시 1회. 앱을 처음 연 화면(로그인·자동 로그인·새로고침)이면 session_start,
  // 서비스 안 다른 메뉴에서 이동해 왔으면 internal_nav.
  kanban_viewed: { entry_type: 'session_start' | 'internal_nav' };
  // 전형 단계 이름 변경 저장 성공. method는 수정 진입 방식(stage_name_edit_trigger와 같은 값).
  kanban_stage_renamed: { method: 'button' | 'double_click' };
  // 지원 현황 수정 모달 저장 성공. 항목별 변경 여부를 보내며, 바뀐 항목이 없으면 보내지 않는다.
  // 공고 상세 드로어(지원 현황·지원 마감일 공용). screen은 드로어가 열린 화면이다.
  // PostHog는 저장 전체를 card_detail_saved 하나로 보내므로, 노션 설계에 맞춰 GA4 전용으로 나눈다.
  // 비어 있던 메모에 첫 글자를 입력한 순간 (드로어를 열 때마다 1회)
  memo_input_started: { screen: CardDetailSource };
  // 기존 메모를 수정해 저장에 성공한 순간 (빈 메모를 처음 채운 저장은 제외)
  memo_edited: { screen: CardDetailSource };
  // 첨부 파일 단계. picker_opened: 파일 선택창 열림, canceled: 선택 없이 닫음,
  // saved/failed: 저장 결과(file_count는 이번 저장의 새 파일 수), failed는 선택 단계 검증 실패도 포함.
  card_file_attached: {
    step: 'picker_opened' | 'canceled' | 'saved' | 'failed';
    screen: CardDetailSource;
    error_code:
      'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'STORAGE_LIMIT_EXCEEDED' | 'unknown' | undefined;
    file_count: number | undefined;
  };
  // URL 등록 저장 결과. saved는 새로 등록한 URL마다 1회, failed는 저장 1회당 1회.
  // category_source: selected(카테고리를 직접 고름, '기타' 포함) / default(선택 없이 자동 '기타').
  card_link_registered:
    | {
        step: 'saved';
        screen: CardDetailSource;
        category: string;
        category_source: 'selected' | 'default';
        error_code: undefined;
      }
    | {
        step: 'failed';
        screen: CardDetailSource;
        category: undefined;
        category_source: undefined;
        error_code: 'STORAGE_LIMIT_EXCEEDED' | 'unknown';
      };

  // 지원 마감일 화면 표시 1회 (로그인 확인 후)
  deadlines_viewed: Record<string, never>;
  // 지원 마감일 화면의 수정 모달 저장 성공. 마감일(상시 채용 전환 포함)·전형 단계 변경 여부를 함께 보내며,
  // 바뀐 항목이 없으면 보내지 않는다. PostHog는 같은 저장을 kanban_card_deadline_changed·
  // kanban_card_stage_changed 두 이벤트로 나눠 보낸다.
  deadline_card_edited: { deadline_changed: 'true' | 'false'; stage_changed: 'true' | 'false' };
  kanban_card_edited: {
    company_name_changed: 'true' | 'false';
    title_changed: 'true' | 'false';
    url_changed: 'true' | 'false';
    deadline_changed: 'true' | 'false';
  };
}

export type Ga4EventName = keyof Ga4EventMap;
