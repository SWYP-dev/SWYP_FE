'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadDocumentFile,
  registerDocumentLink,
  deleteDocument,
  fetchDownloadUrl,
} from './documentsApi';
import { kanbanKeys } from '@/features/kanban/api/useKanbanQuery';
import { updateCardMemo } from '@/features/kanban/api/kanbanApi';

// 카드 상세 드로어의 "저장" 일괄 커밋 — 메모·첨부 파일·URL 링크 변경분을 한 번에 반영.
// 저장 전까지는 모두 드로어의 로컬 draft로만 존재하므로, 저장하지 않고 새로고침하면
// 입력값이 남지 않는다.
export interface SaveCardDetailPayload {
  /** 변경됐을 때만 전달 */
  memo?: string;
  /** 저장 실패 시 메모를 되돌리기 위한 직전 값. memo를 넘길 때 같이 넘긴다. */
  previousMemo?: string;
  /** 아직 업로드하지 않은 첨부 파일 */
  createdFiles: File[];
  /** 신규 등록할 링크 */
  createdLinks: { category: string; url: string }[];
  /** 목록에서 제거된 기존 서류(파일·링크 공용 — DELETE 엔드포인트가 같다) */
  deleted: number[];
}

export function useSaveCardDetail(cardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    // 하나라도 실패하면 이번 저장에서 반영된 것을 전부 되돌리고 예외를 던진다.
    // 서버에 트랜잭션이 없어 클라이언트에서 보상 요청으로 맞춘다.
    mutationFn: async (payload: SaveCardDetailPayload) => {
      const createdIds: number[] = [];
      let memoApplied = false;

      try {
        // 1) 생성 — 되돌릴 수 있다(삭제).
        //    파일은 순차 업로드. 동시에 올리면 실패율이 올라가고 어디까지 올라갔는지도 알기 어렵다.
        for (const file of payload.createdFiles) {
          const created = await uploadDocumentFile(cardId, file, file.name);
          createdIds.push(created.id);
        }
        for (const body of payload.createdLinks) {
          const created = await registerDocumentLink(cardId, body);
          createdIds.push(created.id);
        }

        // 2) 메모 — 되돌릴 수 있다(직전 값으로 다시 PATCH).
        if (payload.memo !== undefined) {
          await updateCardMemo(cardId, payload.memo);
          memoApplied = true;
        }

        // 3) 삭제 — 되돌릴 수 없으므로 가장 마지막에 둔다.
        //    앞 단계가 실패하면 여기까지 오지 않으므로 서버 상태가 그대로 유지된다.
        for (const documentId of payload.deleted) {
          await deleteDocument(cardId, documentId);
        }
      } catch (err) {
        // 보상 요청. 이것까지 실패하면 더 할 수 있는 게 없으므로 원래 에러를 그대로 올린다.
        await Promise.allSettled([
          ...createdIds.map((id) => deleteDocument(cardId, id)),
          ...(memoApplied ? [updateCardMemo(cardId, payload.previousMemo ?? '')] : []),
        ]);
        throw err;
      }
    },
    // Promise를 반환하면 mutateAsync가 재조회 완료까지 기다린다 —
    // 호출부에서 갱신된 상세 데이터로 안전하게 draft를 재동기화하기 위함.
    onSettled: () =>
      Promise.all([
        // 일부만 성공했더라도 서버 상태를 다시 읽어 화면을 실제 값에 맞춘다.
        queryClient.invalidateQueries({ queryKey: kanbanKeys.cardDetail(cardId) }),
        queryClient.invalidateQueries({ queryKey: kanbanKeys.board() }),
      ]),
  });
}

// 다운로드: URL 발급 후 새 탭에서 열기
export function useDownloadDocument(cardId: number) {
  return useMutation({
    mutationFn: async (documentId: number) => {
      const { downloadUrl } = await fetchDownloadUrl(cardId, documentId);
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    },
  });
}
