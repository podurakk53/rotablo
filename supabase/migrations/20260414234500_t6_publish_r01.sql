do $$
declare
  pilot_route_id uuid;
  pilot_status public.content_status;
begin
  select id, status
  into pilot_route_id, pilot_status
  from public.route
  where code = 'R01';

  if pilot_route_id is null then
    raise exception 'R01 route not found.';
  end if;

  if pilot_status = 'draft'::public.content_status then
    perform public.transition_route_status(pilot_route_id, 'published'::public.content_status);
  elsif pilot_status <> 'published'::public.content_status then
    raise exception 'R01 is in unsupported status: %', pilot_status;
  end if;
end;
$$;
