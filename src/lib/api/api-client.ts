import type { ApiResponse } from '@/types/api';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from './token';
import { clearAuthUserOutsideReact } from '@/features/auth/store/authStore';
import { openLoginModalOutsideReact } from '@/features/auth/store/loginModalStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 서버가 success: false로 응답할 때 던지는 에러 객체
export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

// 1.2 Access Token 재발급 API를 직접 호출 (apiFetch를 쓰면 무한루프가 되니 fetch를 그대로 씀)
async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('리프레시 토큰이 없습니다.');

  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const json: ApiResponse<{ accessToken: string }> = await res.json();

  if (!res.ok || !json.success || !json.data) {
    clearTokens();
    throw new Error('토큰 재발급 실패');
  }

  setAccessToken(json.data.accessToken);
  return json.data.accessToken;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown; // 객체를 그대로 넘기면 내부에서 JSON.stringify 처리
}

// 모든 API 호출이 거쳐가는 공통 함수.
// 사용 예: apiFetch<FeedItem[]>('/api/v1/feed')
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const accessToken = getAccessToken();
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    body: isFormData
      ? (options.body as FormData)
      : options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  });

  if (res.status === 401 && !isRetry) {
    try {
      await refreshAccessToken();
      return apiFetch<T>(path, options, true);
    } catch {
      clearTokens();
      clearAuthUserOutsideReact();
      // ⚠️ [QA 반영] 기존엔 window.location.href = '/'로 강제 이동시켰음 — 비로그인
      // 상태로 보호된 페이지(칸반/스크랩/마감일 등)에 들어가면 페이지가 잠깐 보였다가
      // 다시 통합 공고 탐색으로 튕기는 것처럼 보여 UX가 나빴음. 페이지 이동 대신
      // 전역 로그인 모달을 띄워서, 사용자가 현재 페이지에 머문 채로 로그인을
      // 유도받도록 변경.
      openLoginModalOutsideReact();
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
  }

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new ApiClientError(res.status, json.code ?? 'UNKNOWN', json.message ?? '알 수 없는 오류');
  }

  return json.data as T;
}
