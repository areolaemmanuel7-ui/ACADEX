-- ACADEX student profile and matching setup
-- Run this in Supabase Dashboard > SQL Editor.
-- This stores profile details but does NOT treat email ownership as proof of enrolment.

create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  university text not null,
  department text not null,
  academic_level text not null,
  campus_location text,
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_profiles enable row level security;

drop policy if exists "Authenticated students can view profiles" on public.student_profiles;
create policy "Authenticated students can view profiles"
on public.student_profiles for select
to authenticated
using (true);

drop policy if exists "Students can insert their own profile" on public.student_profiles;
create policy "Students can insert their own profile"
on public.student_profiles for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Students can update their own profile" on public.student_profiles;
create policy "Students can update their own profile"
on public.student_profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists student_profiles_university_idx
on public.student_profiles (lower(university));

create index if not exists student_profiles_department_idx
on public.student_profiles (lower(department));

create or replace function public.sync_acadex_student_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ? 'full_name'
     and new.raw_user_meta_data ? 'university'
     and new.raw_user_meta_data ? 'department'
     and new.raw_user_meta_data ? 'academic_level' then
    insert into public.student_profiles
      (user_id, full_name, university, department, academic_level, updated_at)
    values
      (new.id,
       coalesce(new.raw_user_meta_data ->> 'full_name',''),
       coalesce(new.raw_user_meta_data ->> 'university',''),
       coalesce(new.raw_user_meta_data ->> 'department',''),
       coalesce(new.raw_user_meta_data ->> 'academic_level',''),
       now())
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      university = excluded.university,
      department = excluded.department,
      academic_level = excluded.academic_level,
      updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists on_acadex_auth_user_created on auth.users;
create trigger on_acadex_auth_user_created
after insert or update of raw_user_meta_data on auth.users
for each row execute procedure public.sync_acadex_student_profile();

create or replace function public.find_student_matches(result_limit integer default 6)
returns table (
  user_id uuid,
  full_name text,
  university text,
  department text,
  match_reason text
)
language sql
security invoker
set search_path = public
as $$
  with me as (
    select university, department
    from public.student_profiles
    where user_id = auth.uid()
  )
  select p.user_id, p.full_name, p.university, p.department,
    case
      when lower(p.university) = lower(me.university)
       and lower(p.department) = lower(me.department)
        then 'Same university and department'
      when lower(p.university) = lower(me.university)
        then 'Same university'
      else 'Another university'
    end as match_reason
  from public.student_profiles p
  cross join me
  where p.user_id <> auth.uid()
  order by
    case
      when lower(p.university) = lower(me.university)
       and lower(p.department) = lower(me.department) then 1
      when lower(p.university) = lower(me.university) then 2
      else 3
    end,
    p.created_at desc
  limit greatest(1, least(coalesce(result_limit, 6), 20));
$$;

grant execute on function public.find_student_matches(integer) to authenticated;
