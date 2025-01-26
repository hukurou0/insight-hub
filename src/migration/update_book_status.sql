-- 既存の'読了'ステータスを'読了(ノート未完成)'に更新
update books
set 
  status = '読了(ノート未完成)',
  updated_at = timezone('utc'::text, now())
where status = '読了';

-- 既存の'読了（ノート未完成）'を'読了(ノート未完成)'に更新（全角括弧を半角に）
update books
set 
  status = '読了(ノート未完成)',
  updated_at = timezone('utc'::text, now())
where status = '読了（ノート未完成）';

-- 既存の'読了（ノート完成）'を'読了(ノート完成)'に更新（全角括弧を半角に）
update books
set 
  status = '読了(ノート完成)',
  updated_at = timezone('utc'::text, now())
where status = '読了（ノート完成）';