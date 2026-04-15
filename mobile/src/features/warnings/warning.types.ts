export type WarningSeverity = 'info' | 'caution' | 'high';
export type WarningCategory = 'general' | 'vehicle';

export interface WarningItem {
  ruleCode: string;
  category: WarningCategory;
  severity: WarningSeverity;
  message: string;
  sourceSummary: string;
}
