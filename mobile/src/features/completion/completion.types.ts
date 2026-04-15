export type CompletionEntityType = 'stage' | 'sideQuest';

export interface StageCompletionRecord {
  id: string;
  routeSessionId: string;
  entityType: CompletionEntityType;
  entityId: string;
  completionSource: 'manual';
  completedAt: string;
}
