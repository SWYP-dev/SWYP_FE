// GA4(GTM dataLayer)로 보내는 이벤트 이름·속성 목록.
// 노션 「GA4 이벤트 설계」 문서와 일치시킨다. 이름·속성을 바꿀 때는 노션을 먼저 고친다.
// pushDataLayerEvent(src/lib/gtm.ts)가 이 목록을 기준으로 이벤트 이름·속성을 검사한다.
// PostHog와 같은 행동은 이름·속성을 맞춰 두 도구 수치를 비교할 수 있게 한다.

export type LoginEntry = 'landing_navbar' | 'login_modal';

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

  // 전형 단계 이름 수정 진입. GA4 전용 이벤트 (PostHog에는 없음)
  stage_name_edit_trigger: { method: 'button' | 'double_click' };
}

export type Ga4EventName = keyof Ga4EventMap;
