'use client';

import { useEffect, useState } from 'react';
import { useNotificationSettings } from '@/features/notification/api/useNotificationQuery';
import { useUpdateNotificationSettings } from '@/features/notification/api/useNotificationMutations';

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-[24px] w-[40px] shrink-0 rounded-max transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-fill-primary' : 'bg-neutral-200'
      }`}
    >
      <span
        className={`absolute top-1/2 size-[18px] -translate-y-1/2 rounded-max bg-base-white transition-transform ${
          checked ? 'left-[19px]' : 'left-[3px]'
        }`}
      />
    </button>
  );
}

// Figma "설정 - 알림"(node 226:28862) 스펙 반영.
// ⚠️ 디자인은 "이메일 알림" / "카카오톡 리마인드 알림" 2개 토글만 존재.
// 카카오톡 알림은 PRD Phase 6(v1.7, MVP 제외)이고 API(5.1/5.2)에도 필드가
// 없어 비활성화 처리 — 백엔드에 카카오 알림 API 추가되면 연동 필요.
export default function SettingsNotificationsPage() {
  const { data, isLoading } = useNotificationSettings();
  const updateMutation = useUpdateNotificationSettings();

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    if (!data || isSynced) return;
    setEmailEnabled(data.emailEnabled);
    setIsSynced(true);
  }, [data, isSynced]);

  if (isLoading || !data) {
    return (
      <div className="flex w-full flex-col items-start gap-4">
        <div className="h-[140px] w-full animate-pulse rounded-xl bg-neutral-100" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex w-full flex-col items-start gap-7 rounded-xl bg-base-white p-7">
        <p className="w-full text-7 font-semibold leading-[1.4] text-label-base">알림</p>

        <div className="flex w-full flex-col items-start gap-5">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-1 flex-col items-start gap-2">
              <p className="text-3 font-medium text-label-base">이메일 알림</p>
              <p className="text-1 font-medium text-label-body">
                마감일이 다가오면 이메일로 알려드려요.
              </p>
            </div>
            <ToggleSwitch
              label="이메일 알림"
              checked={emailEnabled}
              disabled={updateMutation.isPending}
              onChange={(next) => {
                setEmailEnabled(next);
                updateMutation.mutate({
                  emailEnabled: next,
                  inAppEnabled: data.inAppEnabled,
                  remindDays: data.remindDays,
                });
              }}
            />
          </div>

          <div className="h-px w-full bg-line-secondary" />

          <div className="flex w-full items-center justify-between">
            <div className="flex flex-1 flex-col items-start gap-2">
              <p className="text-3 font-medium text-label-base">카카오톡 리마인드 알림</p>
              <p className="text-1 font-medium text-label-body">
                마감일이 다가오면 카카오톡으로 알려드려요.
              </p>
            </div>
            {/* ⚠️ 백엔드 API 없음(Phase 6/v1.7 미구현) — 비활성화 */}
            <ToggleSwitch label="카카오톡 리마인드 알림" checked={false} disabled onChange={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
