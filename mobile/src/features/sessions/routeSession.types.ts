export type RouteSessionStatus = 'active' | 'incomplete' | 'completed';

export interface RouteSessionRecord {
  id: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  routeDistanceKm: number;
  vehicleProfileId: string;
  vehicleLabel: string;
  budgetScenarioId: string | null;
  status: RouteSessionStatus;
  selectedStageIds: string[];
  plannedSideQuestIds: string[];
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface RouteSessionInput {
  routeId: string;
  routeCode: string;
  routeName: string;
  routeDistanceKm: number;
  vehicleProfileId: string;
  vehicleLabel: string;
  selectedStageIds: string[];
}
