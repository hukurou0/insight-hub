-- booksテーブルにuser_idカラムを追加（存在しない場合のみ）
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'books' and column_name = 'user_id'
  ) then
    alter table books add column user_id uuid references auth.users(id);
    alter table books alter column user_id set not null;
  end if;
end $$;

-- booksテーブルのRLSポリシーを更新
drop policy if exists "Anyone can read books" on books;
drop policy if exists "Anyone can insert books" on books;
drop policy if exists "Anyone can update books" on books;
drop policy if exists "Anyone can delete books" on books;
drop policy if exists "Users can read own books" on books;
drop policy if exists "Users can insert own books" on books;
drop policy if exists "Users can update own books" on books;
drop policy if exists "Users can delete own books" on books;

create policy "Users can read own books"
  on books for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own books"
  on books for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own books"
  on books for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own books"
  on books for delete
  to authenticated
  using (auth.uid() = user_id);

-- ストレージのポリシーを更新
drop policy if exists "Anyone can upload book covers" on storage.objects;
drop policy if exists "Anyone can update book covers" on storage.objects;
drop policy if exists "Anyone can read book covers" on storage.objects;
drop policy if exists "Anyone can delete book covers" on storage.objects;
drop policy if exists "Users can upload book covers" on storage.objects;
drop policy if exists "Users can update book covers" on storage.objects;
drop policy if exists "Users can read book covers" on storage.objects;
drop policy if exists "Users can delete book covers" on storage.objects;

create policy "Users can upload book covers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'books' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update book covers"
  on storage.objects for update
  to authenticated
  with check (bucket_id = 'books' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read book covers"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'books' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete book covers"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'books' and auth.uid()::text = (storage.foldername(name))[1]);