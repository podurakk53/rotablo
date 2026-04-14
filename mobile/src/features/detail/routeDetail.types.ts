export interface RouteDetailSideQuest {
  id: string;
  code: string;
  slug: string;
  orderIndex: number;
  name: string;
  type: string;
  stopStyle: string;
  summary: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
}

export interface RouteDetailStage {
  id: string;
  code: string;
  slug: string;
  sequenceIndex: number;
  title: string;
  originLabel: string;
  destinationLabel: string;
  summary: string;
  distanceKm: number;
  sideQuests: RouteDetailSideQuest[];
}

export interface RouteDetail {
  id: string;
  code: string;
  slug: string;
  name: string;
  family: string;
  summary: string;
  originLabel: string;
  destinationLabel: string;
  plannedDistanceKm: number;
  plannedStageCount: number;
  isLoop: boolean;
  regionSet: string[];
  stages: RouteDetailStage[];
}
