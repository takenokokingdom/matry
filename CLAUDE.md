# CLAUDE.md

このファイルはClaude Code（claude.ai/code）がこのリポジトリで作業する際のガイドです。

## プロジェクト概要

**Matry** — エンジニアでない人がAIとチャットしながらスマホアプリを作れるサービス。マトリョーシカ人形（アプリの中にアプリ）からの命名。AIがReact Nativeのコードを丸ごと生成するため、テンプレート不要でネイティブ品質のアプリ体験を実現する。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| モバイル | React Native (Expo) |
| バックエンド | Next.js API Routes |
| ホスティング | Vercel |
| DB / 認証 | Supabase |
| ランタイム | WebView + Babel standalone（生成アプリ用） |
| AI | Claude API（`claude-sonnet-4-6`、ストリーミング） |
| エージェント | カスタム実装（フレームワークなし） |

## アーキテクチャ

```
React Native (Expo)
  ホーム画面 / チャットUI / プレビュー（WebView + Babel standalone）
        ↕
Next.js API Routes (Vercel)
  カスタムエージェントループ: Claude API呼び出し、tool_use制御、Supabase操作
        ↕                    ↕
Claude API              Supabase
会話・ヒアリング          アプリ保存 / ユーザーDB
コード生成 / tool_use     共有データ / 認証
```

## AIエージェントループ（コード生成）

Next.js API Routesで手書きしたループ — エージェントフレームワークは使わない。

1. Claude APIがReactコードを生成（ストリーミング）
2. サンドボックス検証:
   - Babelトランスパイルエラー
   - 構文エラー / import漏れ
   - 使用禁止ライブラリへの参照
   - ランタイムエラー
3. エラー時（最大3リトライ）: エラー内容をClaudeにフィードバックして修正させる
4. 成功時: プレビュー表示

## 主要な設計方針

- **エージェントフレームワークなし** — エージェントループはNext.js API Routesで手書き。この方針を維持する。
- **生成アプリはWebView + Babel standaloneで動く** — ネイティブコードではなく、クライアント側でトランスパイルするReactコンポーネント。生成コードはこのサンドボックスに対応している必要がある。
- **ストリーミング** — Claudeのレスポンスはストリーミング。コード生成・会話の両方でストリーミングAPIを使う。
- **会話履歴 = 仕様書** — チャットログがアプリ仕様書を兼ねる。1メッセージ1DBレコードで保存。
- **アプリバージョン管理** — 保存するアプリはすべてSupabase上でバージョン履歴をサポートする。
- **フォーク関係** — フォークしたアプリは`parent_app_id`参照を保持し、「××をもとに作成」と表示する。
- **AIモデレーション** — ストア公開前に自動でClaudeがスキャン。手動レビューなし。

## Phase 1 スコープ（まずここを作る）

会話ベースのアプリ作成、ストリーミング生成、エラー検証ループ、フルスクリーンプレビュー、アプリ保存・一覧、ホーム画面へのアイコン配置、共有、ユーザーごとのDB、アプリストア（公開・検索・追加・レビュー・フォーク）、AI自動モデレーション。

## Phase 2（今は対象外）

マイク・カメラ、プッシュ通知、ネイティブブリッジ、データ共有、Androidフローティングオーバーレイ、通報機能。

---

## 開発方針

### ブランチ戦略（GitHub Flow）

- `main` = 本番相当。直接pushしない。
- ブランチ命名はIssueラベルに対応させる:
  - `feature/xxx` — 新機能
  - `bug/xxx` — 不具合修正
  - `task/xxx` — 設定・調査・リファクタなど
- PRを出すとVercelがプレビューURLを自動発行（ステージング相当）。
- レビュー・確認OKでmainにマージ → 本番に自動デプロイ。
- ユーザーが増えてきたら慎重なフローに移行する。

### mainへのマージ条件

mainにマージされるものはすべて以下を満たしていること：
- CIが通っている（lint / type check / test）
- Vercelプレビューで動作確認済み
- オーナーのApproveが完了している

### CI（GitHub Actions）

| タイミング | 実行内容 |
|-----------|---------|
| PR作成・pushのたび | lint / type check / test |
| mainへのマージ | 本番デプロイ（Vercel）+ semantic-releaseによるバージョンタグ・GitHubリリース自動作成 |
| PR作成時（Vercel） | プレビューURL自動発行 |

### バージョン管理（semantic-release）

Conventional Commitsのtypeに応じて自動でバージョンを決定し、タグ・GitHubリリースを作成する。

| コミット | バージョン |
|---------|----------|
| `fix:` | patch（1.0.0 → 1.0.1） |
| `feat:` | minor（1.0.0 → 1.1.0） |
| `feat!:` / BREAKING CHANGE | major（1.0.0 → 2.0.0） |

### イシュー管理

- タスクはすべてGitHub Issueで管理する。
- ラベルは3種類: `feature`（新機能）・`bug`（不具合）・`task`（作業）
- Issue階層: Feature → Task（Sub-issueで紐付け）、Bugは独立

### コミットメッセージ・PRタイトル（Conventional Commits）

```
<type>: <概要>
```

| type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `chore` | 設定・依存関係など |
| `refactor` | リファクタリング |
| `docs` | ドキュメント |
| `test` | テスト |
| `style` | フォーマット・見た目のみ |

例: `feat: チャット画面にストリーミング表示を追加`

コミットメッセージ・PRタイトルは日本語で書く。

### リンター・フォーマッタ

- **Biome** を使う（ESLint + Prettierの代替）。
- Next.js側・Expo側で共通のBiome設定を使う。
- フォーマットはBiome任せ。手動で整形しない。

### Claude Codeの運用ルール

オーナーとClaude Codeの二人体制で開発する。以下のルールを必ず守ること。

**Claudeが自律的にやっていいこと**
- Issueの作成
- featureブランチの作成・push
- PRの作成
- オーナーが承認済みのPRのマージ

**必ずオーナーに確認してから実行すること**
- ブランチの削除
- 強制push（`--force`）
- IssueやPRのクローズ・削除
- mainブランチへの直接操作

**GitHub上のコメント・返信**
- IssueやPRにコメント・返信する際は、必ず冒頭に「🤖 Claude Code:」と明記する。
- オーナーのアカウントで投稿されるため、AIが書いたものだと明示する必要がある。

**開発フロー**
1. オーナーが指示を出す
2. ClaudeがIssueを作成し、featureブランチを切って開発する
3. ClaudeがPRを作成する
4. オーナーがレビュー・承認する
5. ClaudeがPRをマージする
