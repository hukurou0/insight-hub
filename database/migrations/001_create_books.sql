-- Create books table if it doesn't exist
do $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'books') then
    create table books (
      id uuid default uuid_generate_v4() primary key,
      user_id uuid references auth.users(id) on delete cascade,
      title text not null,
      author text not null,
      status text not null default 'unread',
      category text,
      cover_image text,
      notes text,
      last_read_date timestamp with time zone,
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now()
    );
  end if;
end $$;

-- Drop existing policies if they exist
do $$
begin
  drop policy if exists "Users can view their own books" on books;
  drop policy if exists "Users can insert their own books" on books;
  drop policy if exists "Users can update their own books" on books;
  drop policy if exists "Users can delete their own books" on books;
end $$;

-- Enable RLS
alter table books enable row level security;

-- Create new policies
create policy "Users can view their own books"
  on books for select
  using (auth.uid() = user_id);

create policy "Users can insert their own books"
  on books for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own books"
  on books for update
  using (auth.uid() = user_id);

create policy "Users can delete their own books"
  on books for delete
  using (auth.uid() = user_id);