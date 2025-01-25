-- ストレージバケットの作成（存在しない場合のみ）
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'books'
  ) then
    insert into storage.buckets (id, name, public)
    values ('books', 'books', true);
  end if;
end $$;

-- ストレージポリシーの設定
-- 既存のポリシーを削除
drop policy if exists "Anyone can upload book covers" on storage.objects;
drop policy if exists "Anyone can update book covers" on storage.objects;
drop policy if exists "Anyone can read book covers" on storage.objects;
drop policy if exists "Anyone can delete book covers" on storage.objects;

-- 新しいポリシーを作成
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