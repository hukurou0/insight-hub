-- 既存のテーブルが存在する場合は削除
drop table if exists books;

-- booksテーブルの作成
create table books (
  id uuid primary key,
  title text not null,
  author text not null,
  status text not null check (status in ('未読', '読書中', '読了')),
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

-- RLSポリシーの設定
alter table books enable row level security;

-- 匿名ユーザーに対する読み取り/書き込み権限の付与
create policy "Anyone can read books"
  on books for select
  to anon
  using (true);

create policy "Anyone can insert books"
  on books for insert
  to anon
  with check (true);

create policy "Anyone can update books"
  on books for update
  to anon
  using (true);

create policy "Anyone can delete books"
  on books for delete
  to anon
  using (true);