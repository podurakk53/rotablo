create extension if not exists pgcrypto with schema extensions;

create type public.route_family as enum ('main', 'bypass', 'connector');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.side_quest_type as enum ('gastronomy', 'viewpoint', 'natureSpot', 'ancientSite', 'driveSegment', 'townStop');
create type public.stop_style as enum ('stop', 'drive');
create type public.hairpin_density as enum ('low', 'medium', 'high');
create type public.fatigue_load as enum ('low', 'medium', 'high');
create type public.body_type as enum ('sedan', 'suv', 'hatchback', 'coupe', 'convertible');
create type public.drivetrain as enum ('fwd', 'rwd', 'awd', '4wd');
create type public.ground_clearance_class as enum ('low', 'medium', 'high');
create type public.tire_season as enum ('summer', 'allSeason', 'winter');
create type public.route_session_status as enum ('active', 'incomplete', 'completed');
create type public.completion_entity_type as enum ('stage', 'sideQuest');
create type public.completion_source as enum ('manual');

create table public.hazard_profile (
  id uuid primary key default extensions.gen_random_uuid(),
  low_clearance_risk boolean not null default false,
  rough_surface_risk boolean not null default false,
  high_altitude_risk boolean not null default false,
  narrow_road_risk boolean not null default false,
  steep_grade_risk boolean not null default false,
  hairpin_density public.hairpin_density not null default 'low',
  rain_sensitive boolean not null default false,
  fog_sensitive boolean not null default false,
  snow_sensitive boolean not null default false,
  remote_access_risk boolean not null default false,
  fatigue_load public.fatigue_load not null default 'low',
  notes text
);

create table public.route (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique,
  slug text not null unique,
  name text not null,
  family public.route_family not null,
  summary text not null,
  description text,
  origin_label text not null,
  destination_label text not null,
  is_loop boolean not null default false,
  country_set text[] not null default '{}',
  region_set text[] not null default '{}',
  planned_stage_count integer not null default 0 check (planned_stage_count >= 0),
  planned_distance_km numeric(8,1) not null default 0 check (planned_distance_km >= 0),
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  published_at timestamptz,
  revision_number integer not null default 1 check (revision_number >= 1)
);

create table public.stage (
  id uuid primary key default extensions.gen_random_uuid(),
  route_id uuid not null references public.route(id) on delete cascade,
  code text not null,
  slug text not null,
  sequence_index integer not null check (sequence_index >= 1),
  day_number integer check (day_number is null or day_number >= 1),
  day_label text,
  title text not null,
  origin_label text not null,
  destination_label text not null,
  summary text not null,
  distance_km numeric(8,1) not null check (distance_km >= 0),
  estimated_drive_minutes integer check (estimated_drive_minutes is null or estimated_drive_minutes >= 0),
  difficulty_score integer check (difficulty_score is null or difficulty_score between 1 and 5),
  scenery_score integer check (scenery_score is null or scenery_score between 1 and 5),
  quest_tags text[] not null default '{}',
  primary_visit_name text,
  primary_visit_summary text,
  detour_anchor_name text,
  detour_km numeric(8,1) not null default 0 check (detour_km >= 0),
  surface_type text,
  road_character text,
  lodging_options jsonb,
  food_options jsonb,
  hazard_profile_id uuid not null references public.hazard_profile(id) on delete restrict,
  status public.content_status not null default 'draft',
  constraint stage_route_code_unique unique (route_id, code),
  constraint stage_route_slug_unique unique (route_id, slug),
  constraint stage_route_sequence_unique unique (route_id, sequence_index),
  constraint stage_id_route_id_unique unique (id, route_id)
);

create table public.side_quest (
  id uuid primary key default extensions.gen_random_uuid(),
  host_stage_id uuid not null,
  host_route_id uuid not null references public.route(id) on delete cascade,
  code text not null,
  slug text not null,
  order_index integer not null check (order_index >= 1),
  name text not null,
  type public.side_quest_type not null,
  stop_style public.stop_style not null,
  summary text not null,
  distance_km numeric(8,1) not null check (distance_km >= 0),
  detour_km numeric(8,1) not null default 0 check (detour_km >= 0),
  detour_anchor_name text,
  latitude numeric(9,6) not null check (latitude between -90 and 90),
  longitude numeric(9,6) not null check (longitude between -180 and 180),
  difficulty_score integer check (difficulty_score is null or difficulty_score between 1 and 5),
  scenery_score integer check (scenery_score is null or scenery_score between 1 and 5),
  quest_tags text[] not null default '{}',
  hazard_profile_id uuid not null references public.hazard_profile(id) on delete restrict,
  status public.content_status not null default 'draft',
  constraint side_quest_host_stage_host_route_fk
    foreign key (host_stage_id, host_route_id)
    references public.stage(id, route_id)
    on delete cascade,
  constraint side_quest_route_code_unique unique (host_route_id, code),
  constraint side_quest_route_slug_unique unique (host_route_id, slug),
  constraint side_quest_stage_order_unique unique (host_stage_id, order_index)
);

create table public.vehicle_profile (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand text not null,
  model text not null,
  body_type public.body_type not null,
  drivetrain public.drivetrain not null,
  ground_clearance_class public.ground_clearance_class not null,
  tire_season public.tire_season not null,
  is_primary boolean not null default false
);

create unique index vehicle_profile_one_primary_per_user_idx
  on public.vehicle_profile (user_id)
  where is_primary = true;

create table public.budget_scenario (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  fuel_price_tl_per_liter numeric(10,2) not null check (fuel_price_tl_per_liter >= 0),
  consumption_liters_per_100_km numeric(10,2) not null check (consumption_liters_per_100_km >= 0),
  lodging_tier text not null,
  lodging_daily_tl numeric(10,2) not null check (lodging_daily_tl >= 0),
  food_daily_tl numeric(10,2) not null check (food_daily_tl >= 0),
  currency text not null default 'TRY'
);

create table public.route_session (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  route_id uuid not null references public.route(id) on delete cascade,
  vehicle_profile_id uuid not null references public.vehicle_profile(id) on delete restrict,
  budget_scenario_id uuid references public.budget_scenario(id) on delete set null,
  status public.route_session_status not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  active_stage_id uuid references public.stage(id) on delete set null,
  selected_stage_ids uuid[],
  planned_side_quest_ids uuid[],
  constraint route_session_completed_at_chk check (
    (status = 'completed' and completed_at is not null)
    or (status in ('active', 'incomplete') and completed_at is null)
  )
);

create unique index route_session_one_open_per_user_route_idx
  on public.route_session (user_id, route_id)
  where status in ('active', 'incomplete');

create table public.stage_completion (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  route_session_id uuid not null references public.route_session(id) on delete cascade,
  entity_type public.completion_entity_type not null,
  entity_id uuid not null,
  completion_source public.completion_source not null default 'manual',
  completed_at timestamptz not null default now(),
  notes text,
  constraint stage_completion_unique_per_entity unique (route_session_id, entity_type, entity_id)
);

create index stage_route_id_idx on public.stage (route_id);
create index side_quest_host_route_id_idx on public.side_quest (host_route_id);
create index side_quest_host_stage_id_idx on public.side_quest (host_stage_id);
create index route_status_sort_order_idx on public.route (status, sort_order);
create index route_session_user_id_idx on public.route_session (user_id);
create index route_session_route_id_idx on public.route_session (route_id);
create index stage_completion_route_session_id_idx on public.stage_completion (route_session_id);
