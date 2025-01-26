# InsightHub

読書体験をより深く、より豊かにするためのアプリケーションです。

## 機能

- 本の登録（手動入力またはカメラで表紙を撮影）
- 読書状態の管理（未読、読書中、読了）
- 評価機能（5段階評価）
- 本の削除

## セットアップ

1. リポジトリをクローン:
```bash
git clone [repository-url]
cd book-tracker
```

2. 依存関係をインストール:
```bash
npm install
```

3. 環境変数の設定:
- `.env.example` ファイルを `.env` にコピー
- OpenAI APIキーを設定
```bash
cp .env.example .env
```
`.env` ファイルを編集し、`VITE_OPENAI_API_KEY` に有効なOpenAI APIキーを設定してください。

4. アプリケーションの起動:
```bash
npm run dev
```

## カメラ機能の使用方法

1. 「本を追加」フォームで「カメラで読み取る」ボタンをクリック
2. カメラが起動したら、本の表紙が画面に収まるように調整
3. 「撮影」ボタンをクリック
4. AIが表紙から本のタイトルと著者を自動で認識し、フォームに入力

## 技術スタック

- React + TypeScript
- Vite
- Chakra UI
- OpenAI Vision API
