import type { HazardProfileTraits, RouteDetail, RouteDetailSideQuest, RouteDetailStage } from './routeDetail.types';

type RouteDetailRow = {
  id: string;
  code: string;
  slug: string;
  name: string;
  family: string;
  summary: string;
  origin_label: string;
  destination_label: string;
  planned_distance_km: number;
  planned_stage_count: number;
  is_loop: boolean;
  region_set: string[];
  stages: Array<{
    id: string;
    code: string;
    slug: string;
    sequence_index: number;
    title: string;
    origin_label: string;
    destination_label: string;
    summary: string;
    distance_km: number;
    hazard: HazardRow | null;
    sideQuests: Array<{
      id: string;
      code: string;
      slug: string;
      order_index: number;
      name: string;
      type: string;
      stop_style: string;
      summary: string;
      distance_km: number;
      latitude: number;
      longitude: number;
      hazard: HazardRow | null;
    }> | null;
  }> | null;
};

type SideQuestRow = {
  id: string;
  code: string;
  slug: string;
  order_index: number;
  name: string;
  type: string;
  stop_style: string;
  summary: string;
  distance_km: number;
  latitude: number;
  longitude: number;
  hazard: HazardRow | null;
};

type HazardRow = {
  low_clearance_risk: boolean;
  rough_surface_risk: boolean;
  high_altitude_risk: boolean;
  narrow_road_risk: boolean;
  steep_grade_risk: boolean;
  hairpin_density: HazardProfileTraits['hairpinDensity'];
  rain_sensitive: boolean;
  fog_sensitive: boolean;
  snow_sensitive: boolean;
  remote_access_risk: boolean;
  fatigue_load: HazardProfileTraits['fatigueLoad'];
};

function readPublicEnv(name: 'EXPO_PUBLIC_SUPABASE_URL' | 'EXPO_PUBLIC_SUPABASE_ANON_KEY') {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.[name]?.trim();
}

function getSupabaseRestConfig() {
  const url = readPublicEnv('EXPO_PUBLIC_SUPABASE_URL');
  const anonKey = readPublicEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !anonKey) {
    throw new Error('Supabase public config missing. Fill mobile/.env or Expo public env values.');
  }

  return { url, anonKey };
}

function mapHazard(row: HazardRow | null): HazardProfileTraits {
  return {
    lowClearanceRisk: row?.low_clearance_risk ?? false,
    roughSurfaceRisk: row?.rough_surface_risk ?? false,
    highAltitudeRisk: row?.high_altitude_risk ?? false,
    narrowRoadRisk: row?.narrow_road_risk ?? false,
    steepGradeRisk: row?.steep_grade_risk ?? false,
    hairpinDensity: row?.hairpin_density ?? 'low',
    rainSensitive: row?.rain_sensitive ?? false,
    fogSensitive: row?.fog_sensitive ?? false,
    snowSensitive: row?.snow_sensitive ?? false,
    remoteAccessRisk: row?.remote_access_risk ?? false,
    fatigueLoad: row?.fatigue_load ?? 'low',
  };
}

function mapSideQuest(row: SideQuestRow): RouteDetailSideQuest {
  return {
    id: row.id,
    code: row.code,
    slug: row.slug,
    orderIndex: row.order_index,
    name: row.name,
    type: row.type,
    stopStyle: row.stop_style,
    summary: row.summary,
    distanceKm: row.distance_km,
    latitude: row.latitude,
    longitude: row.longitude,
    hazard: mapHazard(row.hazard),
  };
}

function mapStage(row: NonNullable<RouteDetailRow['stages']>[number]): RouteDetailStage {
  return {
    id: row.id,
    code: row.code,
    slug: row.slug,
    sequenceIndex: row.sequence_index,
    title: row.title,
    originLabel: row.origin_label,
    destinationLabel: row.destination_label,
    summary: row.summary,
    distanceKm: row.distance_km,
    hazard: mapHazard(row.hazard),
    sideQuests: (row.sideQuests ?? []).map(mapSideQuest).sort((a, b) => a.orderIndex - b.orderIndex),
  };
}

export async function fetchPublishedRouteDetail(routeId: string): Promise<RouteDetail> {
  const { url, anonKey } = getSupabaseRestConfig();
  const endpoint = new URL('/rest/v1/route', url);

  endpoint.searchParams.set(
    'select',
    'id,code,slug,name,family,summary,origin_label,destination_label,planned_distance_km,planned_stage_count,is_loop,region_set,stages:stage(id,code,slug,sequence_index,title,origin_label,destination_label,summary,distance_km,hazard:hazard_profile(low_clearance_risk,rough_surface_risk,high_altitude_risk,narrow_road_risk,steep_grade_risk,hairpin_density,rain_sensitive,fog_sensitive,snow_sensitive,remote_access_risk,fatigue_load),sideQuests:side_quest(id,code,slug,order_index,name,type,stop_style,summary,distance_km,latitude,longitude,hazard:hazard_profile(low_clearance_risk,rough_surface_risk,high_altitude_risk,narrow_road_risk,steep_grade_risk,hairpin_density,rain_sensitive,fog_sensitive,snow_sensitive,remote_access_risk,fatigue_load)))'
  );
  endpoint.searchParams.set('id', `eq.${routeId}`);
  endpoint.searchParams.set('status', 'eq.published');
  endpoint.searchParams.set('limit', '1');

  const response = await fetch(endpoint.toString(), {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Route detail request failed with ${response.status}.`);
  }

  const rows = (await response.json()) as RouteDetailRow[];
  const row = rows[0];

  if (!row) {
    throw new Error('Published route detail not found.');
  }

  return {
    id: row.id,
    code: row.code,
    slug: row.slug,
    name: row.name,
    family: row.family,
    summary: row.summary,
    originLabel: row.origin_label,
    destinationLabel: row.destination_label,
    plannedDistanceKm: row.planned_distance_km,
    plannedStageCount: row.planned_stage_count,
    isLoop: row.is_loop,
    regionSet: row.region_set ?? [],
    stages: (row.stages ?? []).map(mapStage).sort((a, b) => a.sequenceIndex - b.sequenceIndex),
  };
}
