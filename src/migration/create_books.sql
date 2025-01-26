-- 既存のテーブルが存在する場合は削除
drop table if exists books;

-- booksテーブルの作成
create table books (
  id uuid primary key,
  user_id uuid not null references auth.users(id),
  title text not null,
  author text not null,
  status text not null check (status in ('未読', '読書中', '読了(ノート未完成)', '読了(ノート完成)')),
  category text,
  cover_image text,
  notes text,
  last_read_date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- インデックスの作成
create index books_title_idx on books (title);
create index books_author_idx on books (author);
create index books_status_idx on books (status);
create index books_category_idx on books (category);
create index books_user_id_idx on books (user_id);

-- RLSポリシーの設定
alter table books enable row level security;

-- ユーザーごとのアクセス制御
create policy "Enable read access for authenticated users"
  on books for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on books for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Enable update access for authenticated users"
  on books for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Enable delete access for authenticated users"
  on books for delete
  to authenticated
  using (auth.uid() = user_id);