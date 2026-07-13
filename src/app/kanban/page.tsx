<KanbanBoard
  initialStages={MOCK_KANBAN_STAGES}
  onAddStage={() => {
    // TODO: 스테이지 추가 모달 연동 (최대 10개 제한 체크 포함, 3.7)
  }}
  onRenameStage={(stageId, newName) => {
    void stageId;
    void newName;
    // TODO: PATCH /api/v1/kanban/stages/{stageId} 연동 (3.8)
  }}
  onDeleteStage={(stageId) => {
    void stageId;
    // TODO: 카드 있을 경우 이동 대상 선택 팝업 연동 (3.9)
  }}
  onCardMove={(cardId, fromStageId, toStageId) => {
    void cardId;
    void fromStageId;
    void toStageId;
    // TODO: PATCH /api/v1/kanban/cards/{cardId}/stage 연동 (3.3)
  }}
/>;
