create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.hazard_profile
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.route
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.stage
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.side_quest
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.vehicle_profile
  add column if not exists model_year integer,
  add column if not exists reference_vehicle_key text;

alter table public.vehicle_profile
  drop constraint if exists vehicle_profile_model_year_chk;

alter table public.vehicle_profile
  add constraint vehicle_profile_model_year_chk
  check (model_year is null or model_year between 1980 and 2035);

drop trigger if exists hazard_profile_set_updated_at on public.hazard_profile;
create trigger hazard_profile_set_updated_at
before update on public.hazard_profile
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists route_set_updated_at on public.route;
create trigger route_set_updated_at
before update on public.route
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists stage_set_updated_at on public.stage;
create trigger stage_set_updated_at
before update on public.stage
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists side_quest_set_updated_at on public.side_quest;
create trigger side_quest_set_updated_at
before update on public.side_quest
for each row
execute function public.set_updated_at_timestamp();

create or replace function public.validate_route_publishability(target_route_id uuid)
returns table (
  issue_code text,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_route public.route%rowtype;
  stage_count integer;
  invalid_stage_count integer;
  invalid_side_quest_count integer;
  invalid_stage_sequence_count integer;
begin
  if auth.uid() is not null and not public.is_editorial_user() then
    raise exception 'Editorial role required';
  end if;

  select *
  into target_route
  from public.route
  where id = target_route_id;

  if not found then
    return query
    select
      'route_not_found'::text,
      'Route bulunamadi.'::text;
    return;
  end if;

  if btrim(coalesce(target_route.name, '')) = '' then
    return query
    select
      'route_name_missing'::text,
      'Route name zorunludur.'::text;
  end if;

  if btrim(coalesce(target_route.summary, '')) = '' then
    return query
    select
      'route_summary_missing'::text,
      'Route summary zorunludur.'::text;
  end if;

  if btrim(coalesce(target_route.origin_label, '')) = '' then
    return query
    select
      'route_origin_missing'::text,
      'Route origin zorunludur.'::text;
  end if;

  if btrim(coalesce(target_route.destination_label, '')) = '' then
    return query
    select
      'route_destination_missing'::text,
      'Route destination zorunludur.'::text;
  end if;

  if target_route.planned_stage_count <= 0 then
    return query
    select
      'route_planned_stage_count_invalid'::text,
      'Route plannedStageCount sifirdan buyuk olmali.'::text;
  end if;

  if target_route.planned_distance_km <= 0 then
    return query
    select
      'route_planned_distance_invalid'::text,
      'Route plannedDistanceKm sifirdan buyuk olmali.'::text;
  end if;

  select count(*)
  into stage_count
  from public.stage s
  where s.route_id = target_route_id;

  if stage_count = 0 then
    return query
    select
      'route_stage_missing'::text,
      'Publish icin en az bir stage gereklidir.'::text;
  end if;

  if stage_count <> target_route.planned_stage_count then
    return query
    select
      'route_stage_count_mismatch'::text,
      format(
        'Route plannedStageCount=%s ama kayitli stage sayisi=%s.',
        target_route.planned_stage_count,
        stage_count
      )::text;
  end if;

  select count(*)
  into invalid_stage_sequence_count
  from (
    select
      s.sequence_index,
      row_number() over (order by s.sequence_index asc) as expected_sequence
    from public.stage s
    where s.route_id = target_route_id
  ) ordered_stage
  where ordered_stage.sequence_index <> ordered_stage.expected_sequence;

  if invalid_stage_sequence_count > 0 then
    return query
    select
      'stage_sequence_invalid'::text,
      'Stage sequenceIndex degerleri 1''den baslayip bosluksuz ilerlemelidir.'::text;
  end if;

  select count(*)
  into invalid_stage_count
  from public.stage s
  where s.route_id = target_route_id
    and (
      btrim(coalesce(s.title, '')) = ''
      or btrim(coalesce(s.origin_label, '')) = ''
      or btrim(coalesce(s.destination_label, '')) = ''
      or btrim(coalesce(s.summary, '')) = ''
      or s.distance_km is null
      or s.distance_km <= 0
      or s.hazard_profile_id is null
    );

  if invalid_stage_count > 0 then
    return query
    select
      'stage_required_fields_missing'::text,
      format(
        '%s stage kaydinda title, origin, destination, summary, distance veya hazard profile eksik.',
        invalid_stage_count
      )::text;
  end if;

  select count(*)
  into invalid_side_quest_count
  from public.side_quest sq
  where sq.host_route_id = target_route_id
    and (
      btrim(coalesce(sq.name, '')) = ''
      or sq.type is null
      or sq.stop_style is null
      or btrim(coalesce(sq.summary, '')) = ''
      or sq.distance_km is null
      or sq.distance_km < 0
      or sq.latitude is null
      or sq.longitude is null
      or sq.hazard_profile_id is null
    );

  if invalid_side_quest_count > 0 then
    return query
    select
      'side_quest_required_fields_missing'::text,
      format('%s side quest kaydinda type, summary, koordinat veya hazard profile eksik.', invalid_side_quest_count)::text;
  end if;
end;
$$;

do $$
declare
  pilot_route_id uuid;
  issue_count integer;
begin
  select id
  into pilot_route_id
  from public.route
  where code = 'R01';

  if pilot_route_id is not null then
    select count(*)
    into issue_count
    from public.validate_route_publishability(pilot_route_id);

    if issue_count > 0 then
      raise exception 'R01 publish validation returned % issue(s) after hardening.', issue_count;
    end if;
  end if;
end;
$$;
