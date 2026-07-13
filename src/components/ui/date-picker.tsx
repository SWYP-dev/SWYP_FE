'use client';

import { useState } from 'react';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  className?: string;
}

// Figma DatePicker 마스터 컴포넌트(node 54:13560) 스펙 반영.
// 날짜 타입 4종: default(평일) / sunday(일요일 빨간) / today(오늘 파란 텍스트) / selected(파란 원 배경)
// 좌우 chevron으로 월 이동. 외부 라이브러리 없이 직접 구현.
export function DatePicker({ value, onChange, className = '' }: DatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth());

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  // 이번 달 1일의 요일 (0=일, 1=월, ...)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  // 이번 달 마지막 날짜
  const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();

  // 7열 그리드로 맞추기 위해 앞뒤 빈 칸 포함
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];
  // 행으로 분리
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
    if (rows[rows.length - 1].length < 7) {
      rows[rows.length - 1].push(...Array(7 - rows[rows.length - 1].length).fill(null));
    }
  }

  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

  function getDayType(day: number, colIdx: number): 'sunday' | 'today' | 'selected' | 'default' {
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);

    if (value) {
      const v = new Date(value);
      v.setHours(0, 0, 0, 0);
      if (date.getTime() === v.getTime()) return 'selected';
    }
    if (date.getTime() === today.getTime()) return 'today';
    if (colIdx === 0) return 'sunday';
    return 'default';
  }

  const headerText = `${viewYear}년 ${viewMonth + 1}월`;

  return (
    <div
      className={`flex w-[375px] flex-col gap-3 items-center justify-center overflow-hidden rounded-2xl border border-line-secondary bg-base-white p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex w-full items-center justify-center bg-base-white px-4 py-2">
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="이전 달"
            onClick={prevMonth}
            className="flex size-[18px] items-center justify-center text-label-base"
          >
            <ChevronLeftIcon />
          </button>
          <p className="whitespace-nowrap text-5 font-semibold text-label-base">{headerText}</p>
          <button
            type="button"
            aria-label="다음 달"
            onClick={nextMonth}
            className="flex size-[18px] items-center justify-center text-label-base"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex w-full flex-col gap-3">
        {/* 요일 헤더 */}
        <div className="flex w-full items-center justify-between text-5 font-medium">
          {DAY_NAMES.map((name, i) => (
            <p
              key={name}
              className={`w-9 text-center ${i === 0 ? 'text-status-negative' : 'text-label-body'}`}
            >
              {name}
            </p>
          ))}
        </div>

        {/* 날짜 행 */}
        <div className="flex flex-col gap-4">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex w-full items-center justify-between">
              {row.map((day, colIdx) => {
                if (!day) {
                  return <div key={colIdx} className="size-9" />;
                }
                const type = getDayType(day, colIdx);
                return (
                  <button
                    key={colIdx}
                    type="button"
                    onClick={() => onChange(new Date(viewYear, viewMonth, day))}
                    className={`flex size-9 flex-col items-center justify-center rounded-max text-5 ${
                      type === 'selected'
                        ? 'bg-fill-primary font-semibold text-base-white'
                        : type === 'today'
                          ? 'font-semibold text-label-primary'
                          : type === 'sunday'
                            ? 'font-medium text-status-negative'
                            : 'font-medium text-label-base'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 4L6 9L11 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 4L12 9L7 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
