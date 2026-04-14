import type { RouteCatalogItem } from './catalog.types';

type RouteRow = {
  id: string;
  code: string;
  slug: string;
  name: string;
  summary: string;
  origin_label: string;
  destination_label: string;
  planned_distance_km: number;
  planned_stage_count: number;
  sort_order: number;
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

export async function fetchPublishedRoutes(): Promise<RouteCatalogItem[]> {
  const { url, anonKey } = getSupabaseRestConfig();
  const endpoint = new URL('/rest/v1/route', url);

  endpoint.searchParams.set(
    'select',
    'id,code,slug,name,summary,origin_label,destination_label,planned_distance_km,planned_stage_count,sort_order'
  );
  endpoint.searchParams.set('status', 'eq.published');
  endpoint.searchParams.set('order', 'sort_order.asc');

  const response = await fetch(endpoint.toString(), {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed with ${response.status}.`);
  }

  const rows = (await response.json()) as RouteRow[];

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    originLabel: row.origin_label,
    destinationLabel: row.destination_label,
    plannedDistanceKm: row.planned_distance_km,
    plannedStageCount: row.planned_stage_count,
    sortOrder: row.sort_order,
  }));
}
