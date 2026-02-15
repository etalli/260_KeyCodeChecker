# Key Code Checker

キーボード入力のイベント情報を確認できる Electron アプリです。  
`event.key` / `event.code` / 修飾キー状態 / 履歴 / コンボ検出 / テスト機能をまとめて確認できます。

## 主な機能

- キーイベント表示: `event.key`, `event.code`, `event.keyCode`, `event.which`, `event.location`
- 修飾キー表示: `Shift`, `Alt`, `Ctrl`, `Meta(Command)`, `CapsLock`, `NumLock`, `Fn`
- 同時押し表示: 現在押下中のキー一覧をリアルタイム表示
- 履歴表示: 直近 100 件の入力履歴
- 言語切替: クライアントの言語設定に応じて日本語/英語を自動切替
- キーコンボ検出: 事前定義したコンボを検出
- Electron グローバルショートカット状態表示
- テストモード
  - シーケンステスト（指定コンボを順番に入力して PASS/MISS 判定）
  - 全キー入力テスト（`event.code` ベースの網羅率表示）

## `index.html` の使い方

Electron を使わず、ブラウザで `index.html` を直接開いて確認できます。

1. `index.html` をブラウザで開く
2. ページをアクティブにしてキー入力する
3. 画面上のイベント値・履歴・WPM を確認する

補足:

- `i18n.js` / `constants.js` / `app.js` / `wpm.js` / `test.js` / `combo.js` / `init.js` を同じフォルダに置いたまま利用してください
- ブラウザ利用時は `Electron グローバルショートカット` は利用できません（`window.electronAPI` がないため）
- OS予約ショートカット（例: `Command+Shift+3`）はブラウザでは取得できない場合があります

## セットアップ

前提:

- Node.js と npm がインストール済みであること

インストール:

```bash
cd "/Users/k2/Library/CloudStorage/Dropbox/MyProjects/260_KeyCodeChecker"
npm install
```

起動:

```bash
npm start
```

## 使い方

1. アプリ起動後、ウィンドウをアクティブにする
2. キーボードを入力して各イベント値を確認
3. `検出中コンボ` でコンボ判定結果を確認
4. `テストモード` で順次テストを実行
5. `全キー入力テスト` で未入力キーを埋める

## グローバルショートカットについて

- `CommandOrControl+Shift+3` / `CommandOrControl+Shift+4` の登録可否を表示します
- `OK` なら Electron 側で登録済み、`NG` は OS 予約などで使用不可の可能性があります
- OS や他アプリ設定で動作は変わるため、実機での確認が必要です

## ファイル構成

- `index.html`: UI
- `styles.css`: スタイル定義
- `i18n.js`: 多言語辞書
- `constants.js`: キー配列/コンボ定義などの定数
- `app.js`: フロントエンド共通ロジックと初期化関数
- `wpm.js`: WPM計測ロジック
- `combo.js`: コンボ判定ロジック
- `test.js`: テストモード判定ロジック
- `init.js`: 起動時の初期化実行
- `main.js`: Electron メインプロセス
- `preload.js`: Renderer との安全な橋渡し (IPC)
- `package.json`: 起動スクリプトと依存定義

## 補足

- `Fn` や一部のシステム予約ショートカットは環境により取得できない場合があります
- キーボード配列差（JIS/US）により `event.code` や入力可否が異なることがあります
