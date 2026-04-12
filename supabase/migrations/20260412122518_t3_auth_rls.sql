create type public.app_role as enum ('user', 'editor', 'admin');

create table public.app_user_role (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger app_user_role_touch_updated_at
before update on public.app_user_role
for each row
execute function public.touch_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_user_role (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

insert into public.app_user_role (user_id, role)
select id, 'user'::public.app_role
from auth.users
on conflict (user_id) do nothing;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select aur.role
      from public.app_user_role aur
      where aur.user_id = auth.uid()
    ),
    'user'::public.app_role
  );
$$;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'admin'::public.app_role;
$$;

create or replace function public.is_editorial_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() in ('editor'::public.app_role, 'admin'::public.app_role);
$$;

create or replace function public.is_route_published(target_route_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.route r
    where r.id = target_route_id
      and r.status = 'published'::public.content_status
  );
$$;

create or replace function public.user_has_route_session(target_route_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.route_session rs
      where rs.user_id = auth.uid()
        and rs.route_id = target_route_id
    );
$$;

create or replace function public.is_stage_publicly_visible(target_stage_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.stage s
    join public.route r on r.id = s.route_id
    where s.id = target_stage_id
      and s.status = 'published'::public.content_status
      and r.status = 'published'::public.content_status
  );
$$;

create or replace function public.can_read_hazard_profile(target_hazard_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.stage s
    join public.route r on r.id = s.route_id
    where s.hazard_profile_id = target_hazard_profile_id
      and (
        (
          s.status = 'published'::public.content_status
          and r.status = 'published'::public.content_status
        )
        or (
          r.status <> 'published'::public.content_status
          and public.user_has_route_session(r.id)
        )
      )
  )
  or exists (
    select 1
    from public.side_quest sq
    join public.stage s on s.id = sq.host_stage_id
    join public.route r on r.id = sq.host_route_id
    where sq.hazard_profile_id = target_hazard_profile_id
      and (
        (
          sq.status = 'published'::public.content_status
          and s.status = 'published'::public.content_status
          and r.status = 'published'::public.content_status
        )
        or (
          r.status <> 'published'::public.content_status
          and public.user_has_route_session(r.id)
        )
      )
  );
$$;

create or replace function public.owns_vehicle_profile(target_vehicle_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.vehicle_profile vp
    where vp.id = target_vehicle_profile_id
      and vp.user_id = auth.uid()
  );
$$;

create or replace function public.owns_budget_scenario(target_budget_scenario_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.budget_scenario bs
    where bs.id = target_budget_scenario_id
      and bs.user_id = auth.uid()
  );
$$;

create or replace function public.owns_route_session(target_route_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.route_session rs
    where rs.id = target_route_session_id
      and rs.user_id = auth.uid()
  );
$$;

create or replace function public.route_session_is_mutable(target_route_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.route_session rs
    join public.route r on r.id = rs.route_id
    where rs.id = target_route_session_id
      and rs.user_id = auth.uid()
      and r.status = 'published'::public.content_status
  );
$$;

create or replace function public.completion_target_matches_session(
  target_route_session_id uuid,
  target_entity_type public.completion_entity_type,
  target_entity_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when target_entity_type = 'stage'::public.completion_entity_type then exists (
      select 1
      from public.route_session rs
      join public.stage s on s.id = target_entity_id
      where rs.id = target_route_session_id
        and s.route_id = rs.route_id
    )
    when target_entity_type = 'sideQuest'::public.completion_entity_type then exists (
      select 1
      from public.route_session rs
      join public.side_quest sq on sq.id = target_entity_id
      where rs.id = target_route_session_id
        and sq.host_route_id = rs.route_id
    )
    else false
  end;
$$;

grant usage on schema public to anon, authenticated;

grant select on public.route, public.stage, public.side_quest, public.hazard_profile to anon, authenticated;
grant select, insert, update, delete on public.route, public.stage, public.side_quest, public.hazard_profile to authenticated;
grant select, insert, update, delete on public.vehicle_profile, public.budget_scenario, public.route_session, public.stage_completion, public.app_user_role to authenticated;

alter table public.route enable row level security;
alter table public.stage enable row level security;
alter table public.side_quest enable row level security;
alter table public.hazard_profile enable row level security;
alter table public.vehicle_profile enable row level security;
alter table public.budget_scenario enable row level security;
alter table public.route_session enable row level security;
alter table public.stage_completion enable row level security;
alter table public.app_user_role enable row level security;

create policy route_public_or_session_read
on public.route
for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  or public.user_has_route_session(id)
);

create policy route_editorial_manage
on public.route
for all
to authenticated
using (public.is_editorial_user())
with check (public.is_editorial_user());

create policy stage_public_or_session_read
on public.stage
for select
to anon, authenticated
using (
  (
    status = 'published'::public.content_status
    and public.is_route_published(route_id)
  )
  or (
    not public.is_route_published(route_id)
    and public.user_has_route_session(route_id)
  )
);

create policy stage_editorial_manage
on public.stage
for all
to authenticated
using (public.is_editorial_user())
with check (public.is_editorial_user());

create policy side_quest_public_or_session_read
on public.side_quest
for select
to anon, authenticated
using (
  (
    status = 'published'::public.content_status
    and public.is_stage_publicly_visible(host_stage_id)
  )
  or (
    not public.is_route_published(host_route_id)
    and public.user_has_route_session(host_route_id)
  )
);

create policy side_quest_editorial_manage
on public.side_quest
for all
to authenticated
using (public.is_editorial_user())
with check (public.is_editorial_user());

create policy hazard_profile_public_or_session_read
on public.hazard_profile
for select
to anon, authenticated
using (public.can_read_hazard_profile(id));

create policy hazard_profile_editorial_manage
on public.hazard_profile
for all
to authenticated
using (public.is_editorial_user())
with check (public.is_editorial_user());

create policy vehicle_profile_owner_manage
on public.vehicle_profile
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy budget_scenario_owner_manage
on public.budget_scenario
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy route_session_owner_read
on public.route_session
for select
to authenticated
using (user_id = auth.uid());

create policy route_session_owner_insert
on public.route_session
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_route_published(route_id)
  and public.owns_vehicle_profile(vehicle_profile_id)
  and (
    budget_scenario_id is null
    or public.owns_budget_scenario(budget_scenario_id)
  )
);

create policy route_session_owner_update
on public.route_session
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and public.is_route_published(route_id)
  and public.owns_vehicle_profile(vehicle_profile_id)
  and (
    budget_scenario_id is null
    or public.owns_budget_scenario(budget_scenario_id)
  )
);

create policy route_session_owner_delete
on public.route_session
for delete
to authenticated
using (user_id = auth.uid());

create policy stage_completion_owner_read
on public.stage_completion
for select
to authenticated
using (user_id = auth.uid());

create policy stage_completion_owner_insert
on public.stage_completion
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.route_session_is_mutable(route_session_id)
  and public.completion_target_matches_session(route_session_id, entity_type, entity_id)
);

create policy stage_completion_owner_update
on public.stage_completion
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and public.route_session_is_mutable(route_session_id)
  and public.completion_target_matches_session(route_session_id, entity_type, entity_id)
);

create policy stage_completion_owner_delete
on public.stage_completion
for delete
to authenticated
using (user_id = auth.uid());

create policy app_user_role_self_read
on public.app_user_role
for select
to authenticated
using (user_id = auth.uid());

create policy app_user_role_admin_manage
on public.app_user_role
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());
