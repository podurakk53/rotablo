export interface RouteCatalogItem {
  id: string;
  code: string;
  slug: string;
  name: string;
  summary: string;
  originLabel: string;
  destinationLabel: string;
  plannedDistanceKm: number;
  plannedStageCount: number;
  sortOrder: number;
}
