import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '../api/authApi';

export const userKeys = { me: () => ['users', 'me'] as const };

// GET /api/v1/users/me — 내 정보 조회(계정 이메일)
export function useCurrentUserQuery(enabled: boolean) {
  return useQuery({ queryKey: userKeys.me(), queryFn: fetchCurrentUser, enabled });
}
