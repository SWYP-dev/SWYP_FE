// 플래그 키를 한곳에서 관리해 평가와 노출 조건이 어긋나지 않게 한다.
export const FEATURE_FLAGS = { testSessionLoginEntry: 'test-session-login-entry' } as const;

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];
