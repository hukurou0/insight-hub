-- Auth Policies
alter table auth.users enable row level security;

create policy "Users can view their own user data"
  on auth.users for select
  using (auth.uid() = id);

create policy "Users can update their own user data"
  on auth.users for update
  using (auth.uid() = id);

-- Email Verification
alter table auth.users
  add constraint proper_email
  check (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$');

-- Add user metadata columns if needed
alter table auth.users
  add column if not exists avatar_url text,
  add column if not exists updated_at timestamp with time zone;

-- Trigger to update updated_at
create or replace function auth.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger update_user_updated_at
  before update on auth.users
  for each row
  execute procedure auth.update_updated_at();