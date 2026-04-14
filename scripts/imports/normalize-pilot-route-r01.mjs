import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const inputDir = path.resolve(repoRoot, '../docs');
const outputDir = path.resolve(repoRoot, 'supabase/imports/r01');
const migrationPath = path.resolve(
  repoRoot,
  'supabase/migrations/20260414220000_t4_import_r01_pilot_route.sql'
);
const jsonPath = path.resolve(outputDir, 'route_pack.json');

const files = {
  route: path.resolve(inputDir, 'route.csv'),
  stages: path.resolve(inputDir, 'stages.csv'),
  sideQuests: path.resolve(inputDir, 'side_quests.csv'),
  hazardProfiles: path.resolve(inputDir, 'hazard_profiles.csv'),
};

const sideQuestTypeMap = {
  coastalRoad: 'driveSegment',
  volcanicCrater: 'natureSpot',
  extremePass: 'driveSegment',
  historicCity: 'townStop',
  riverValley: 'driveSegment',
  rockFormations: 'natureSpot',
  technicalCoastal: 'driveSegment',
  technicalMountain: 'driveSegment',
  forestSegment: 'driveSegment',
  extremeRiver: 'driveSegment',
};

const legacyHazardMap = {
  '[UUID_HP01]': {
    low_clearance_risk: false,
    rough_surface_risk: false,
    high_altitude_risk: false,
    narrow_road_risk: false,
    steep_grade_risk: false,
    hairpin_density: 'low',
    rain_sensitive: false,
    fog_sensitive: false,
    snow_sensitive: false,
    remote_access_risk: false,
    fatigue_load: 'low',
  },
  '[UUID_HP02]': {
    low_clearance_risk: false,
    rough_surface_risk: false,
    high_altitude_risk: false,
    narrow_road_risk: false,
    steep_grade_risk: true,
    hairpin_density: 'high',
    rain_sensitive: false,
    fog_sensitive: false,
    snow_sensitive: false,
    remote_access_risk: false,
    fatigue_load: 'medium',
  },
  '[UUID_HP03]': {
    low_clearance_risk: false,
    rough_surface_risk: false,
    high_altitude_risk: false,
    narrow_road_risk: false,
    steep_grade_risk: false,
    hairpin_density: 'medium',
    rain_sensitive: true,
    fog_sensitive: false,
    snow_sensitive: false,
    remote_access_risk: false,
    fatigue_load: 'medium',
  },
  '[UUID_HP04]': {
    low_clearance_risk: true,
    rough_surface_risk: false,
    high_altitude_risk: true,
    narrow_road_risk: false,
    steep_grade_risk: true,
    hairpin_density: 'high',
    rain_sensitive: false,
    fog_sensitive: false,
    snow_sensitive: true,
    remote_access_risk: true,
    fatigue_load: 'high',
  },
  '[UUID_HP05]': {
    low_clearance_risk: true,
    rough_surface_risk: true,
    high_altitude_risk: false,
    narrow_road_risk: true,
    steep_grade_risk: false,
    hairpin_density: 'low',
    rain_sensitive: true,
    fog_sensitive: false,
    snow_sensitive: false,
    remote_access_risk: false,
    fatigue_load: 'medium',
  },
  '[UUID_HP06]': {
    low_clearance_risk: true,
    rough_surface_risk: true,
    high_altitude_risk: false,
    narrow_road_risk: true,
    steep_grade_risk: false,
    hairpin_density: 'medium',
    rain_sensitive: true,
    fog_sensitive: false,
    snow_sensitive: false,
    remote_access_risk: true,
    fatigue_load: 'high',
  },
  '[UUID_HP07]': {
    low_clearance_risk: true,
    rough_surface_risk: true,
    high_altitude_risk: true,
    narrow_road_risk: true,
    steep_grade_risk: true,
    hairpin_density: 'low',
    rain_sensitive: true,
    fog_sensitive: false,
    snow_sensitive: false,
    remote_access_risk: true,
    fatigue_load: 'high',
  },
  '[UUID_HP08]': {
    low_clearance_risk: true,
    rough_surface_risk: true,
    high_altitude_risk: false,
    narrow_road_risk: false,
    steep_grade_risk: false,
    hairpin_density: 'low',
    rain_sensitive: false,
    fog_sensitive: false,
    snow_sensitive: false,
    remote_access_risk: true,
    fatigue_load: 'medium',
  },
  '[UUID_HP09]': {
    low_clearance_risk: false,
    rough_surface_risk: true,
    high_altitude_risk: false,
    narrow_road_risk: true,
    steep_grade_risk: false,
    hairpin_density: 'high',
    rain_sensitive: true,
    fog_sensitive: false,
    snow_sensitive: false,
    remote_access_risk: false,
    fatigue_load: 'medium',
  },
  '[UUID_HP10]': {
    low_clearance_risk: false,
    rough_surface_risk: false,
    high_altitude_risk: true,
    narrow_road_risk: true,
    steep_grade_risk: true,
    hairpin_density: 'high',
    rain_sensitive: false,
    fog_sensitive: true,
    snow_sensitive: true,
    remote_access_risk: true,
    fatigue_load: 'high',
  },
  '[UUID_HP11]': {
    low_clearance_risk: true,
    rough_surface_risk: true,
    high_altitude_risk: false,
    narrow_road_risk: false,
    steep_grade_risk: false,
    hairpin_density: 'low',
    rain_sensitive: false,
    fog_sensitive: false,
    snow_sensitive: false,
    remote_access_risk: true,
    fatigue_load: 'high',
  },
  '[UUID_HP12]': {
    low_clearance_risk: false,
    rough_surface_risk: false,
    high_altitude_risk: false,
    narrow_road_risk: false,
    steep_grade_risk: false,
    hairpin_density: 'medium',
    rain_sensitive: true,
    fog_sensitive: false,
    snow_sensitive: false,
    remote_access_risk: false,
    fatigue_load: 'medium',
  },
  '[UUID_HP13]': {
    low_clearance_risk: false,
    rough_surface_risk: true,
    high_altitude_risk: false,
    narrow_road_risk: true,
    steep_grade_risk: false,
    hairpin_density: 'medium',
    rain_sensitive: false,
    fog_sensitive: true,
    snow_sensitive: false,
    remote_access_risk: true,
    fatigue_load: 'high',
  },
  '[UUID_HP14]': {
    low_clearance_risk: false,
    rough_surface_risk: false,
    high_altitude_risk: true,
    narrow_road_risk: false,
    steep_grade_risk: true,
    hairpin_density: 'high',
    rain_sensitive: false,
    fog_sensitive: false,
    snow_sensitive: true,
    remote_access_risk: false,
    fatigue_load: 'high',
  },
};

const densityRank = { low: 1, medium: 2, high: 3 };

function deterministicUuid(seed) {
  const hash = crypto.createHash('sha1').update(seed).digest('hex');
  const chars = hash.slice(0, 32).split('');
  chars[12] = '5';
  const variant = parseInt(chars[16], 16);
  chars[16] = ((variant & 0x3) | 0x8).toString(16);
  const hex = chars.join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function parseCsv(filePath) {
  const lines = fs
    .readFileSync(filePath, 'utf8')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  const dataLines = lines.slice(1);
  const headers = dataLines[0].split(';');

  return dataLines.slice(1).map((line) => {
    const values = line.split(';');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

function sqlString(value) {
  if (value === null || value === undefined) {
    return 'null';
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlArray(values) {
  if (!values || values.length === 0) {
    return "'{}'::text[]";
  }

  const escaped = values.map((value) => `"${String(value).replace(/"/g, '\\"')}"`);
  return `'{${
    escaped.join(',')
  }}'::text[]`;
}

function sqlBoolean(value) {
  return value ? 'true' : 'false';
}

function splitHazardIds(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeCoordinates(latitudeValue, longitudeValue) {
  const rawLatitude = String(latitudeValue ?? '').trim();
  const rawLongitude = String(longitudeValue ?? '').trim();

  if (rawLatitude.includes(',')) {
    const parts = rawLatitude
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (parts.length === 2) {
      const [lat, lon] = parts.map((item) => Number(item));
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        return { latitude: lat, longitude: lon };
      }
    }
  }

  return {
    latitude: Number(rawLatitude),
    longitude: Number(rawLongitude),
  };
}

function normalizeCompositeProfile(importKey, note, sourceIds) {
  const sourceProfiles = sourceIds.map((sourceId) => {
    const mapped = legacyHazardMap[sourceId];
    if (!mapped) {
      throw new Error(`Missing legacy hazard mapping for ${sourceId}`);
    }
    return mapped;
  });

  const result = {
    id: deterministicUuid(`rotablo:r01:hazard:${importKey}`),
    import_key: importKey,
    source_hazard_ids: sourceIds,
    notes: note,
    low_clearance_risk: sourceProfiles.some((profile) => profile.low_clearance_risk),
    rough_surface_risk: sourceProfiles.some((profile) => profile.rough_surface_risk),
    high_altitude_risk: sourceProfiles.some((profile) => profile.high_altitude_risk),
    narrow_road_risk: sourceProfiles.some((profile) => profile.narrow_road_risk),
    steep_grade_risk: sourceProfiles.some((profile) => profile.steep_grade_risk),
    hairpin_density: 'low',
    rain_sensitive: sourceProfiles.some((profile) => profile.rain_sensitive),
    fog_sensitive: sourceProfiles.some((profile) => profile.fog_sensitive),
    snow_sensitive: sourceProfiles.some((profile) => profile.snow_sensitive),
    remote_access_risk: sourceProfiles.some((profile) => profile.remote_access_risk),
    fatigue_load: 'low',
  };

  for (const profile of sourceProfiles) {
    if (densityRank[profile.hairpin_density] > densityRank[result.hairpin_density]) {
      result.hairpin_density = profile.hairpin_density;
    }
    if (densityRank[profile.fatigue_load] > densityRank[result.fatigue_load]) {
      result.fatigue_load = profile.fatigue_load;
    }
  }

  return result;
}

function buildJsonPack() {
  const [routeRow] = parseCsv(files.route);
  const stageRows = parseCsv(files.stages);
  const sideQuestRows = parseCsv(files.sideQuests);

  const routeId = deterministicUuid(`rotablo:r01:route:${routeRow.code}`);

  const normalizedStages = stageRows.map((row) => {
    const stageId = deterministicUuid(`rotablo:r01:stage:${row.code}`);
    const hazardImportKey = `stage:${row.code}`;
    return {
      id: stageId,
      source_id: row.id,
      route_id: routeId,
      code: row.code,
      slug: row.slug,
      sequence_index: Number(row.sequence_index),
      title: row.title,
      origin_label: row.origin_label,
      destination_label: row.destination_label,
      summary: row.summary,
      distance_km: Number(row.distance_km),
      status: row.status,
      hazard_profile_import_key: hazardImportKey,
      hazard_profile: normalizeCompositeProfile(
        hazardImportKey,
        `R01 import stage ${row.code} from ${row.hazard_profile_id}`,
        [row.hazard_profile_id]
      ),
    };
  });

  const stageIdBySourceId = new Map(normalizedStages.map((stage) => [stage.source_id, stage.id]));

  const normalizedSideQuests = sideQuestRows.map((row) => {
    const sideQuestId = deterministicUuid(`rotablo:r01:sidequest:${row.code}`);
    const sourceHazardIds = splitHazardIds(row.hazard_profile_id);
    const hazardImportKey = `sideQuest:${row.code}`;
    const normalizedType = sideQuestTypeMap[row.type];
    const coordinates = normalizeCoordinates(row.latitude, row.longitude);

    if (!normalizedType) {
      throw new Error(`Missing side quest type mapping for ${row.type}`);
    }

    return {
      id: sideQuestId,
      source_id: row.id,
      host_stage_id: stageIdBySourceId.get(row.host_stage_id),
      host_route_id: routeId,
      code: row.code,
      slug: row.slug,
      order_index: Number(row.order_index),
      name: row.name,
      type: normalizedType,
      source_type: row.type,
      stop_style: row.stop_style,
      summary: row.summary,
      distance_km: Number(row.distance_km),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      status: row.status,
      hazard_profile_import_key: hazardImportKey,
      hazard_profile: normalizeCompositeProfile(
        hazardImportKey,
        `R01 import sideQuest ${row.code} composite from ${sourceHazardIds.join(' + ')}`,
        sourceHazardIds
      ),
    };
  });

  const route = {
    id: routeId,
    source_id: routeRow.id,
    code: routeRow.code,
    slug: routeRow.slug,
    name: routeRow.name,
    family: routeRow.family,
    summary: routeRow.summary,
    description: null,
    origin_label: routeRow.origin_label,
    destination_label: routeRow.destination_label,
    is_loop: true,
    country_set: ['TR'],
    region_set: [
      'Marmara',
      'Ege',
      'Akdeniz',
      'Ic Anadolu',
      'Guneydogu Anadolu',
      'Dogu Anadolu',
      'Karadeniz',
    ],
    planned_stage_count: Number(routeRow.planned_stage_count),
    planned_distance_km: Number(routeRow.planned_distance_km),
    status: routeRow.status,
    sort_order: Number(routeRow.sort_order),
  };

  return {
    generated_at: new Date().toISOString(),
    source_files: files,
    route,
    stages: normalizedStages,
    side_quests: normalizedSideQuests,
    hazard_profiles: [
      ...normalizedStages.map((stage) => stage.hazard_profile),
      ...normalizedSideQuests.map((sideQuest) => sideQuest.hazard_profile),
    ],
    type_mapping: sideQuestTypeMap,
  };
}

function validatePack(pack) {
  for (const stage of pack.stages) {
    const numericValues = [stage.sequence_index, stage.distance_km];
    if (numericValues.some((value) => Number.isNaN(value))) {
      throw new Error(`Invalid numeric value in stage ${stage.code}`);
    }
  }

  for (const sideQuest of pack.side_quests) {
    const numericValues = [
      sideQuest.order_index,
      sideQuest.distance_km,
      sideQuest.latitude,
      sideQuest.longitude,
    ];
    if (numericValues.some((value) => Number.isNaN(value))) {
      throw new Error(`Invalid numeric value in side quest ${sideQuest.code}`);
    }
  }
}

function buildSql(pack) {
  const hazardIds = pack.hazard_profiles.map((profile) => `${sqlString(profile.id)}::uuid`).join(',\n  ');

  const routeInsert = `insert into public.route (\n  id,\n  code,\n  slug,\n  name,\n  family,\n  summary,\n  description,\n  origin_label,\n  destination_label,\n  is_loop,\n  country_set,\n  region_set,\n  planned_stage_count,\n  planned_distance_km,\n  status,\n  sort_order\n) values (\n  ${sqlString(pack.route.id)}::uuid,\n  ${sqlString(pack.route.code)},\n  ${sqlString(pack.route.slug)},\n  ${sqlString(pack.route.name)},\n  ${sqlString(pack.route.family)}::public.route_family,\n  ${sqlString(pack.route.summary)},\n  ${sqlString(pack.route.description)},\n  ${sqlString(pack.route.origin_label)},\n  ${sqlString(pack.route.destination_label)},\n  ${sqlBoolean(pack.route.is_loop)},\n  ${sqlArray(pack.route.country_set)},\n  ${sqlArray(pack.route.region_set)},\n  ${pack.route.planned_stage_count},\n  ${pack.route.planned_distance_km},\n  ${sqlString(pack.route.status)}::public.content_status,\n  ${pack.route.sort_order}\n);`;

  const hazardValues = pack.hazard_profiles
    .map(
      (profile) => `(\n  ${sqlString(profile.id)}::uuid,\n  ${sqlBoolean(profile.low_clearance_risk)},\n  ${sqlBoolean(profile.rough_surface_risk)},\n  ${sqlBoolean(profile.high_altitude_risk)},\n  ${sqlBoolean(profile.narrow_road_risk)},\n  ${sqlBoolean(profile.steep_grade_risk)},\n  ${sqlString(profile.hairpin_density)}::public.hairpin_density,\n  ${sqlBoolean(profile.rain_sensitive)},\n  ${sqlBoolean(profile.fog_sensitive)},\n  ${sqlBoolean(profile.snow_sensitive)},\n  ${sqlBoolean(profile.remote_access_risk)},\n  ${sqlString(profile.fatigue_load)}::public.fatigue_load,\n  ${sqlString(profile.notes)}\n)`
    )
    .join(',\n');

  const stageValues = pack.stages
    .map(
      (stage) => `(\n  ${sqlString(stage.id)}::uuid,\n  ${sqlString(pack.route.id)}::uuid,\n  ${sqlString(stage.code)},\n  ${sqlString(stage.slug)},\n  ${stage.sequence_index},\n  ${sqlString(stage.title)},\n  ${sqlString(stage.origin_label)},\n  ${sqlString(stage.destination_label)},\n  ${sqlString(stage.summary)},\n  ${stage.distance_km},\n  ${sqlString(stage.hazard_profile.id)}::uuid,\n  ${sqlString(stage.status)}::public.content_status\n)`
    )
    .join(',\n');

  const sideQuestValues = pack.side_quests
    .map(
      (sideQuest) => `(\n  ${sqlString(sideQuest.id)}::uuid,\n  ${sqlString(sideQuest.host_stage_id)}::uuid,\n  ${sqlString(pack.route.id)}::uuid,\n  ${sqlString(sideQuest.code)},\n  ${sqlString(sideQuest.slug)},\n  ${sideQuest.order_index},\n  ${sqlString(sideQuest.name)},\n  ${sqlString(sideQuest.type)}::public.side_quest_type,\n  ${sqlString(sideQuest.stop_style)}::public.stop_style,\n  ${sqlString(sideQuest.summary)},\n  ${sideQuest.distance_km},\n  ${sideQuest.latitude},\n  ${sideQuest.longitude},\n  ${sqlString(sideQuest.hazard_profile.id)}::uuid,\n  ${sqlString(sideQuest.status)}::public.content_status\n)`
    )
    .join(',\n');

  return `begin;

do $$
declare
  existing_route_id uuid;
begin
  select id
  into existing_route_id
  from public.route
  where code = ${sqlString(pack.route.code)};

  if existing_route_id is not null
     and exists (
       select 1
       from public.route_session rs
       where rs.route_id = existing_route_id
     ) then
    raise exception 'Cannot reimport route ${pack.route.code} because route_session rows already exist.';
  end if;
end $$;

delete from public.side_quest
where host_route_id in (
  select id from public.route where code = ${sqlString(pack.route.code)}
)
or host_route_id = ${sqlString(pack.route.id)}::uuid;

delete from public.stage
where route_id in (
  select id from public.route where code = ${sqlString(pack.route.code)}
)
or route_id = ${sqlString(pack.route.id)}::uuid;

delete from public.route
where code = ${sqlString(pack.route.code)}
or id = ${sqlString(pack.route.id)}::uuid;

delete from public.hazard_profile
where id in (
  ${hazardIds}
);

${routeInsert}

insert into public.hazard_profile (
  id,
  low_clearance_risk,
  rough_surface_risk,
  high_altitude_risk,
  narrow_road_risk,
  steep_grade_risk,
  hairpin_density,
  rain_sensitive,
  fog_sensitive,
  snow_sensitive,
  remote_access_risk,
  fatigue_load,
  notes
) values
${hazardValues};

insert into public.stage (
  id,
  route_id,
  code,
  slug,
  sequence_index,
  title,
  origin_label,
  destination_label,
  summary,
  distance_km,
  hazard_profile_id,
  status
) values
${stageValues};

insert into public.side_quest (
  id,
  host_stage_id,
  host_route_id,
  code,
  slug,
  order_index,
  name,
  type,
  stop_style,
  summary,
  distance_km,
  latitude,
  longitude,
  hazard_profile_id,
  status
) values
${sideQuestValues};

commit;
`;
}

function main() {
  for (const filePath of Object.values(files)) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing input file: ${filePath}`);
    }
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const pack = buildJsonPack();
  validatePack(pack);
  const sql = buildSql(pack);

  fs.writeFileSync(jsonPath, `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
  fs.writeFileSync(migrationPath, sql, 'utf8');

  console.log(`Wrote normalized pack: ${jsonPath}`);
  console.log(`Wrote import migration: ${migrationPath}`);
  console.log(`Stages: ${pack.stages.length}`);
  console.log(`Side quests: ${pack.side_quests.length}`);
  console.log(`Canonical hazard profiles: ${pack.hazard_profiles.length}`);
}

main();
