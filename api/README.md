# Book Tracker API

FastAPIを使用したBook TrackerアプリケーションのバックエンドAPI。

## セットアップ

1. 環境変数の設定:
`.env`ファイルに以下の環境変数を設定:
```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
```

## 開発サーバーの起動

Dockerを使用して開発サーバーを起動:
```bash
# イメージのビルド
docker build -t book-tracker-api .

# コンテナの起動
docker run -p 8000:8000 -v $(pwd):/app book-tracker-api
```

サーバーは http://localhost:8000 で起動します。

## API ドキュメント

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## エンドポイント

- `GET /api/books` - 本の一覧を取得
- `POST /api/books` - 新しい本を追加
- `GET /api/books/{book_id}` - 特定の本の詳細を取得
- `PUT /api/books/{book_id}` - 本の情報を更新
- `DELETE /api/books/{book_id}` - 本を削除