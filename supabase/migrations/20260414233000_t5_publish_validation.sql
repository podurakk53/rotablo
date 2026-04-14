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

  select count(*)
  into invalid_stage_count
  from public.stage s
  where s.route_id = target_route_id
    and (
      btrim(coalesce(s.title, '')) = ''
      or btrim(coalesce(s.summary, '')) = ''
      or s.distance_km is null
      or s.distance_km <= 0
      or s.hazard_profile_id is null
    );

  if invalid_stage_count > 0 then
    return query
    select
      'stage_required_fields_missing'::text,
      format('%s stage kaydinda title, summary, distance veya hazard profile eksik.', invalid_stage_count)::text;
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

create or replace function public.transition_route_status(
  target_route_id uuid,
  next_status public.content_status
)
returns public.route
language plpgsql
security definer
set search_path = public
as $$
declare
  target_route public.route%rowtype;
  issue_messages text;
begin
  if auth.uid() is not null and not public.is_admin_user() then
    raise exception 'Admin role required';
  end if;

  select *
  into target_route
  from public.route
  where id = target_route_id
  for update;

  if not found then
    raise exception 'Route bulunamadi.';
  end if;

  if target_route.status = next_status then
    return target_route;
  end if;

  if next_status = 'published'::public.content_status and target_route.status <> 'draft'::public.content_status then
    raise exception 'Sadece draft route publish edilebilir.';
  end if;

  if next_status = 'draft'::public.content_status and target_route.status <> 'published'::public.content_status then
    raise exception 'Sadece published route unpublish edilebilir.';
  end if;

  if next_status = 'archived'::public.content_status
     and target_route.status not in ('draft'::public.content_status, 'published'::public.content_status) then
    raise exception 'Sadece draft veya published route archive edilebilir.';
  end if;

  if next_status = 'published'::public.content_status then
    select string_agg(v.message, E'\n')
    into issue_messages
    from public.validate_route_publishability(target_route_id) v;

    if issue_messages is not null then
      raise exception 'Route publish validation failed:%', E'\n' || issue_messages;
    end if;

    update public.route r
    set
      status = 'published'::public.content_status,
      published_at = now(),
      revision_number = case
        when target_route.published_at is null then target_route.revision_number
        else target_route.revision_number + 1
      end
    where r.id = target_route_id
    returning *
    into target_route;

    update public.stage
    set status = 'published'::public.content_status
    where route_id = target_route_id;

    update public.side_quest
    set status = 'published'::public.content_status
    where host_route_id = target_route_id;
  elsif next_status = 'draft'::public.content_status then
    update public.route r
    set status = 'draft'::public.content_status
    where r.id = target_route_id
    returning *
    into target_route;

    update public.stage
    set status = 'draft'::public.content_status
    where route_id = target_route_id;

    update public.side_quest
    set status = 'draft'::public.content_status
    where host_route_id = target_route_id;
  elsif next_status = 'archived'::public.content_status then
    update public.route r
    set status = 'archived'::public.content_status
    where r.id = target_route_id
    returning *
    into target_route;

    update public.stage
    set status = 'archived'::public.content_status
    where route_id = target_route_id;

    update public.side_quest
    set status = 'archived'::public.content_status
    where host_route_id = target_route_id;
  else
    raise exception 'Unsupported target status.';
  end if;

  return target_route;
end;
$$;

revoke all on function public.validate_route_publishability(uuid) from public;
revoke all on function public.transition_route_status(uuid, public.content_status) from public;

grant execute on function public.validate_route_publishability(uuid) to authenticated;
grant execute on function public.transition_route_status(uuid, public.content_status) to authenticated;

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
      raise exception 'R01 publish validation returned % issue(s).', issue_count;
    end if;
  end if;
end;
$$;
