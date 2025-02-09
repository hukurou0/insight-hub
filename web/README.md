# Book Tracker

読書管理と読書ノートを作成するためのアプリケーション

## Project Structure

```
├── database/
│   └── migrations/          # Database migrations
│       ├── 001_create_books.sql
│       ├── 002_create_storage.sql
│       └── 003_update_auth_policies.sql
├── public/                  # Static assets
├── src/
│   ├── features/           # Feature-based organization
│   │   ├── auth/          # Authentication feature
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   └── index.ts
│   │   ├── books/         # Books management feature
│   │   │   ├── components/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   └── layout/        # Layout components
│   │       ├── components/
│   │       └── index.ts
│   ├── shared/            # Shared utilities and services
│   │   ├── services/      # Shared services (e.g., Supabase client)
│   │   ├── utils/         # Shared utilities
│   │   └── index.ts
│   ├── App.tsx           # Main application component
│   └── main.tsx         # Application entry point
```

## Features

- **auth**: ユーザー認証関連の機能
  - ログイン/サインアップ
  - プロフィール管理
  - 認証状態の管理

- **books**: 本の管理機能
  - 本の検索
  - 読書ノートの作成
  - 本の詳細表示
  - カメラでの本の登録（GPT-4 Vision使用）

- **layout**: レイアウト関連のコンポーネント
  - ヘッダー
  - ナビゲーション
  - レスポンシブデザイン

## Database Setup

データベースのマイグレーションファイルは `database/migrations` ディレクトリに配置されています。

### マイグレーションの実行順序

以下の順序でマイグレーションを実行してください：

1. `001_create_books.sql`
   - 本のテーブルとRLSポリシーを作成
   - 既存のテーブルやポリシーがある場合は安全にスキップまたは再作成します

2. `002_create_storage.sql`
   - book-coversバケットを作成
   - ストレージのポリシーを設定
   - バケットを公開設定に変更
   - 既存のポリシーがある場合は一度削除してから再作成します

3. `003_update_auth_policies.sql`
   - 認証関連のポリシーを設定

### マイグレーションの実行方法

Supabaseのダッシュボードで以下の手順でマイグレーションを実行してください：

1. SQLエディタを開く
2. 各マイグレーションファイルの内容をコピー
3. 上記の順序で実行
4. エラーメッセージが表示された場合：
   - "already exists"エラー → 既存のオブジェクトは自動的にスキップまたは再作成されます
   - "Bucket not found"エラー → `002_create_storage.sql`を実行してバケットを作成
   - その他のエラー → エラーメッセージを確認し、必要に応じて修正

### ストレージの設定確認

マイグレーション実行後、以下を確認してください：

1. Storage > Buckets に "book-covers" バケットが存在すること
2. バケットが Public に設定されていること
3. バケットのポリシーが正しく設定されていること
   - アップロード: 認証済みユーザーのみ
   - 閲覧: 全ユーザー
   - 更新/削除: 所有者のみ

## Getting Started

1. 環境変数の設定
```bash
cp .env.example .env
```

必要な環境変数：
- `VITE_SUPABASE_URL`: SupabaseのプロジェクトURL
- `VITE_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `VITE_OPENAI_API_KEY`: OpenAIのAPIキー（本の表紙認識機能に必要）

2. 依存関係のインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm run dev
```

## Development

### コンポーネントの追加

新しいコンポーネントを追加する場合は、適切な機能ディレクトリ内に配置してください：

```bash
src/features/[feature]/components/[ComponentName].tsx
```

### 型定義の追加

新しい型定義は各機能の `types` ディレクトリに追加してください：

```bash
src/features/[feature]/types/[type].ts
```

### ユーティリティの追加

共通のユーティリティ関数は `shared/utils` ディレクトリに追加してください：

```bash
src/shared/utils/[utility].ts
```

## Production Build

本番用ビルドの作成：

```bash
npm run build
```

## License

MIT
