import React from 'react';
import { Pencil, Trash2, ExternalLink, FileText, Plus, ChevronDown, Paperclip } from 'lucide-react';

export default function Solution2Demo() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_40px_90px_-50px_rgba(15,23,42,0.28)]">
      <div className="w-full">
        <div className="flex items-start justify-between border-b border-[#F0F0F0] px-[24px] py-[20px]">
          <div>
            <p className="text-[12px] text-[#9CA3AF]">당근마켓</p>
            <p className="mt-[4px] text-[19px] font-bold tracking-tight text-[#1A1A1A]">
              프론트엔드 개발자
            </p>
          </div>
          <div className="flex gap-[10px] text-[#9CA3AF]">
            <Pencil className="h-[16px] w-[16px]" />
            <Trash2 className="h-[16px] w-[16px]" />
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-[#F0F0F0] border-b border-[#F0F0F0] text-center">
          {[
            { l: '위치', v: '서울' },
            { l: '경력', v: '경력' },
            { l: '마감일', v: '10.28' },
          ].map((s) => (
            <div key={s.l} className="py-[16px]">
              <p className="text-[11px] text-[#9CA3AF]">{s.l}</p>
              <p className="mt-[4px] text-[13px] font-semibold text-[#1A1A1A]">{s.v}</p>
            </div>
          ))}
        </div>

        <div className="px-[24px] py-[20px]">
          <button className="flex w-full items-center justify-center gap-[6px] rounded-lg bg-[#4864F1] py-[12px] text-[14px] font-semibold text-white">
            원본 공고 이동 <ExternalLink className="h-[16px] w-[16px]" />
          </button>

          <p className="mt-[24px] text-[13px] font-semibold text-[#1A1A1A]">서류 첨부</p>
          <div className="mt-[10px] rounded-xl border border-[#E5E7EB] p-[16px]">
            <p className="text-[12.5px] font-semibold text-[#1A1A1A]">[질문 정리]</p>
            <ol className="mt-[8px] space-y-[4px] text-[12px] leading-relaxed text-[#6B7280]">
              <li>1. 직무 구체적 업무 범위</li>
              <li>2. 팀 구성 및 협업 방식</li>
              <li>3. 평가 기준과 일정</li>
            </ol>
            <p className="mt-[12px] text-right text-[10.5px] text-[#D1D5DB]">59/1000</p>
          </div>

          <p className="mt-[20px] text-[13px] font-semibold text-[#1A1A1A]">첨부 파일</p>
          <div className="mt-[10px] flex items-center justify-between rounded-xl border border-[#E5E7EB] p-[14px]">
            <span className="flex items-center gap-[8px] text-[13px] text-[#1A1A1A]">
              <FileText className="h-[16px] w-[16px] text-[#4864F1]" /> 이력서.pdf
              <span className="text-[#9CA3AF]">0.2 MB</span>
            </span>
            <Trash2 className="h-[16px] w-[16px] text-[#9CA3AF]" />
          </div>
          <button className="mt-[10px] flex w-full items-center justify-center gap-[4px] rounded-lg border border-dashed border-[#D1D5DB] py-[10px] text-[12.5px] font-semibold text-[#6B7280]">
            <Plus className="h-[16px] w-[16px]" /> 첨부 파일 추가
          </button>

          <div className="mt-[20px] flex items-center gap-[8px] rounded-lg border border-[#E5E7EB] px-[16px] py-[12px]">
            <Paperclip className="h-[16px] w-[16px] text-[#9CA3AF]" />
            <span className="flex items-center gap-[4px] text-[13px] font-semibold text-[#1A1A1A]">
              포트폴리오 <ChevronDown className="h-[14px] w-[14px]" />
            </span>
            <span className="ml-auto truncate text-[12.5px] text-[#9CA3AF]">jinyworld.site</span>
          </div>
        </div>
      </div>
    </div>
  );
}
