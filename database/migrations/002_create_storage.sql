-- Create storage bucket if it doesn't exist
insert into storage.buckets (id, name)
values ('book-covers', 'book-covers')
on conflict (id) do nothing;

-- Enable Storage
do $$
begin
  -- Drop existing policies if they exist
  drop policy if exists "Users can upload book covers" on storage.objects;
  drop policy if exists "Users can view book covers" on storage.objects;
  drop policy if exists "Users can update their own book covers" on storage.objects;
  drop policy if exists "Users can delete their own book covers" on storage.objects;
end $$;

-- Create new policies
create policy "Users can upload book covers"
  on storage.objects for insert
  with check (
    bucket_id = 'book-covers' AND
    auth.role() = 'authenticated'
  );

create policy "Users can view book covers"
  on storage.objects for select
  using (bucket_id = 'book-covers');

create policy "Users can update their own book covers"
  on storage.objects for update
  using (
    bucket_id = 'book-covers' AND
    auth.uid() = owner
  );

create policy "Users can delete their own book covers"
  on storage.objects for delete
  using (
    bucket_id = 'book-covers' AND
    auth.uid() = owner
  );

-- Set bucket public
update storage.buckets
set public = true
where id = 'book-covers';