-- ============================================================
-- 001_rls_policies.sql
-- Phase 1: Admin-controlled moderation
--
-- Public can read verified resources + locations.
-- Any logged-in user can submit resources or propose edits.
-- Only admins can directly write/update/delete/verify anything.
-- ============================================================

-- Helper function: get the role of the currently logged-in user
create or replace function public.current_user_role()
returns user_role
language sql
security definer
stable
as $$
  select role from public.users where id = auth.uid();
$$;

-- Helper function: check if current user is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;


-- ============================================================
-- RESOURCES
-- ============================================================
alter table public.resources enable row level security;

-- Anyone can read verified, active resources
create policy "Public can view verified resources"
  on public.resources for select
  using (verification_status = 'approved' and is_active = true);

-- Admins can read everything
create policy "Admins can view all resources"
  on public.resources for select
  using (public.is_admin());

-- Any logged-in user can insert (verification_status defaults to pending)
create policy "Logged-in users can submit resources"
  on public.resources for insert
  to authenticated
  with check (
    auth.uid() is not null
    and verification_status = 'pending'
  );

-- Only admins can update or delete
create policy "Admins can update resources"
  on public.resources for update
  using (public.is_admin());

create policy "Admins can delete resources"
  on public.resources for delete
  using (public.is_admin());


-- ============================================================
-- PHYSICAL LOCATIONS
-- ============================================================
alter table public.physical_locations enable row level security;

-- Anyone can read verified locations (join with verified resource)
create policy "Public can view verified locations"
  on public.physical_locations for select
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_id
        and r.verification_status = 'approved'
        and r.is_active = true
    )
  );

-- Admins can read everything
create policy "Admins can view all locations"
  on public.physical_locations for select
  using (public.is_admin());

-- Any logged-in user can add a location to an existing resource
create policy "Logged-in users can add locations"
  on public.physical_locations for insert
  to authenticated
  with check (auth.uid() is not null);

-- Only admins can update or delete
create policy "Admins can update locations"
  on public.physical_locations for update
  using (public.is_admin());

create policy "Admins can delete locations"
  on public.physical_locations for delete
  using (public.is_admin());


-- ============================================================
-- RESOURCE HOURS
-- ============================================================
alter table public.resource_hours enable row level security;

-- Anyone can read hours for verified locations
create policy "Public can view hours for verified locations"
  on public.resource_hours for select
  using (
    exists (
      select 1 from public.physical_locations pl
      join public.resources r on r.id = pl.resource_id
      where pl.id = physical_location_id
        and r.verification_status = 'approved'
        and r.is_active = true
    )
  );

-- Admins can read everything
create policy "Admins can view all hours"
  on public.resource_hours for select
  using (public.is_admin());

-- Any logged-in user can add hours
create policy "Logged-in users can add hours"
  on public.resource_hours for insert
  to authenticated
  with check (auth.uid() is not null);

-- Only admins can update or delete
create policy "Admins can update hours"
  on public.resource_hours for update
  using (public.is_admin());

create policy "Admins can delete hours"
  on public.resource_hours for delete
  using (public.is_admin());


-- ============================================================
-- ONLINE ACCESS
-- ============================================================
alter table public.online_access enable row level security;

create policy "Public can view online access for verified resources"
  on public.online_access for select
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_id
        and r.verification_status = 'approved'
        and r.is_active = true
    )
  );

create policy "Admins can view all online access"
  on public.online_access for select
  using (public.is_admin());

create policy "Logged-in users can add online access"
  on public.online_access for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "Admins can update online access"
  on public.online_access for update
  using (public.is_admin());

create policy "Admins can delete online access"
  on public.online_access for delete
  using (public.is_admin());


-- ============================================================
-- OTHER ACCESS
-- ============================================================
alter table public.other_access enable row level security;

create policy "Public can view other access for verified resources"
  on public.other_access for select
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_id
        and r.verification_status = 'approved'
        and r.is_active = true
    )
  );

create policy "Admins can view all other access"
  on public.other_access for select
  using (public.is_admin());

create policy "Logged-in users can add other access"
  on public.other_access for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "Admins can update other access"
  on public.other_access for update
  using (public.is_admin());

create policy "Admins can delete other access"
  on public.other_access for delete
  using (public.is_admin());


-- ============================================================
-- RESOURCE BENEFITS
-- ============================================================
alter table public.resource_benefits enable row level security;

create policy "Public can view benefits for verified resources"
  on public.resource_benefits for select
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_id
        and r.verification_status = 'approved'
        and r.is_active = true
    )
  );

create policy "Admins can view all benefits"
  on public.resource_benefits for select
  using (public.is_admin());

create policy "Logged-in users can add benefits"
  on public.resource_benefits for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "Admins can update benefits"
  on public.resource_benefits for update
  using (public.is_admin());

create policy "Admins can delete benefits"
  on public.resource_benefits for delete
  using (public.is_admin());


-- ============================================================
-- RESOURCE ELIGIBILITY
-- ============================================================
alter table public.resource_eligibility enable row level security;

create policy "Public can view eligibility for verified resources"
  on public.resource_eligibility for select
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_id
        and r.verification_status = 'approved'
        and r.is_active = true
    )
  );

create policy "Admins can view all eligibility"
  on public.resource_eligibility for select
  using (public.is_admin());

create policy "Logged-in users can add eligibility"
  on public.resource_eligibility for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "Admins can update eligibility"
  on public.resource_eligibility for update
  using (public.is_admin());

create policy "Admins can delete eligibility"
  on public.resource_eligibility for delete
  using (public.is_admin());


-- ============================================================
-- SUBMISSIONS
-- Any logged-in user can submit. Users can see their own.
-- Admins can see and act on all.
-- ============================================================
alter table public.submissions enable row level security;

create policy "Users can view their own submissions"
  on public.submissions for select
  to authenticated
  using (submitted_by = auth.uid());

create policy "Admins can view all submissions"
  on public.submissions for select
  using (public.is_admin());

create policy "Logged-in users can create submissions"
  on public.submissions for insert
  to authenticated
  with check (submitted_by = auth.uid());

create policy "Admins can update submissions"
  on public.submissions for update
  using (public.is_admin());


-- ============================================================
-- EDITS
-- Any logged-in user can propose an edit. Users can see their own.
-- Admins can see and act on all.
-- ============================================================
alter table public.edits enable row level security;

create policy "Users can view their own edits"
  on public.edits for select
  to authenticated
  using (submitted_by = auth.uid());

create policy "Admins can view all edits"
  on public.edits for select
  using (public.is_admin());

create policy "Logged-in users can propose edits"
  on public.edits for insert
  to authenticated
  with check (submitted_by = auth.uid());

create policy "Admins can update edits"
  on public.edits for update
  using (public.is_admin());


-- ============================================================
-- EDIT HISTORY
-- Public audit log for verified resources. Admins see all.
-- ============================================================
alter table public.edit_history enable row level security;

create policy "Public can view edit history for verified resources"
  on public.edit_history for select
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_id
        and r.verification_status = 'approved'
    )
  );

create policy "Admins can view all edit history"
  on public.edit_history for select
  using (public.is_admin());

create policy "Admins can insert edit history"
  on public.edit_history for insert
  with check (public.is_admin());


-- ============================================================
-- COMMUNITY NOTES
-- Anyone can read notes on verified resources.
-- Logged-in users can post. Users can delete their own. Admins can delete any.
-- ============================================================
alter table public.community_notes enable row level security;

create policy "Public can view notes on verified resources"
  on public.community_notes for select
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_id
        and r.verification_status = 'approved'
        and r.is_active = true
    )
  );

create policy "Logged-in users can post notes"
  on public.community_notes for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "Users can delete their own notes"
  on public.community_notes for delete
  to authenticated
  using (author_id = auth.uid());

create policy "Admins can delete any note"
  on public.community_notes for delete
  using (public.is_admin());


-- ============================================================
-- OWNERS
-- Admins manage owner records. Users can see their own.
-- ============================================================
alter table public.owners enable row level security;

create policy "Users can view their own owner records"
  on public.owners for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can view all owner records"
  on public.owners for select
  using (public.is_admin());

create policy "Admins can manage owner records"
  on public.owners for all
  using (public.is_admin());


-- ============================================================
-- VERIFICATION EVENTS
-- Admins only.
-- ============================================================
alter table public.verification_events enable row level security;

create policy "Admins can manage verification events"
  on public.verification_events for all
  using (public.is_admin());


-- ============================================================
-- USERS
-- Users can read and update their own profile. Admins can read all.
-- ============================================================
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  to authenticated
  using (id = auth.uid());

create policy "Admins can view all users"
  on public.users for select
  using (public.is_admin());

create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using (id = auth.uid());
