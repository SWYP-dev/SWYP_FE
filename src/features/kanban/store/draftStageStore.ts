import { create } from 'zustand';

interface DraftStageStore {
  isAddingStage: boolean;
  draftName: string;
  startDraft: () => void;
  setDraftName: (name: string) => void;
  clearDraft: () => void;
}

// 전형 단계 추가 중 페이지 이동해도 입력 중이던 draft가 유지되도록 전역 store로 분리.
// (기존엔 KanbanBoard.tsx의 로컬 useState라 페이지 벗어나면 사라졌음)
export const useDraftStageStore = create<DraftStageStore>((set) => ({
  isAddingStage: false,
  draftName: '',
  startDraft: () => set({ isAddingStage: true, draftName: '' }),
  setDraftName: (name) => set({ draftName: name }),
  clearDraft: () => set({ isAddingStage: false, draftName: '' }),
}));
