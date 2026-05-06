# Melzon

「めるちゃもさん金ネーム獲得記念」をテーマにした、めるちゃもにプレゼントを贈るためのジョーク EC 風 Web アプリです。商品閲覧 → ポイント獲得 → カート → プレゼント完了 → SNS 投稿、までの一連のフローを Next.js 製の SPA としてまとめています。

> 公開先: https://melzon.vercel.app
> サイトは検索エンジンにインデックスされない設定 (`robots.noindex`) です。

## 主な機能

- 商品ブラウズ
  - トップ (おすすめ / 特集 / バナー / ベストセラー導線)
  - 商品詳細 (`/products/[id]`)
  - カテゴリ (`/categories/food`, `/categories/gadget`)
  - ベストセラー (`/bestsellers`)
  - 検索 (`/search?q=...` ※常に「もしかして」を返すジョーク仕様)
- カート / プレゼント
  - カート (`/cart`)、プレゼント確認 (`/checkout`)、完了 (`/complete`)
  - 完了画面で X (Twitter) 投稿用リンクを生成
- ポイント獲得用ミニゲーム (`/games`)
  - めるちゃもを褒める (連打)
  - めるちゃもスロット (3 リール)
  - 賭博神経衰弱めるちゃも (神経衰弱)
- ポイント・カート・直近の注文はすべて `localStorage` で保持 (サーバ永続化なし)

## 技術スタック

- Next.js 15 (App Router) / React 19
- TypeScript (`strict` + `noUncheckedIndexedAccess`)
- Tailwind CSS v4 (PostCSS)
- Radix UI (Dialog / Slot / Toast)、framer-motion、embla-carousel
- Zod (商品データ・カートのバリデーション)
- Vitest (ユニット) / Playwright (E2E)
- パッケージマネージャ: pnpm

## セットアップ

```bash
pnpm install
```

`.env.local` で `NEXT_PUBLIC_SITE_URL` を上書き可能 (デフォルトは `https://melzon.vercel.app`)。

## 開発

このプロジェクトでは **Tailwind v4 + `next dev` (HMR) の組み合わせで CSS が壊れる** 問題があるため、ローカル開発でも `next build` → `next start` のサイクルを回すカスタム監視スクリプトを推奨しています。詳細は `scripts/dev-watch.mjs` 冒頭のコメント参照。

```bash
make run-dev        # 推奨: ファイル変更 → 自動でフルビルド & 再起動 (ポート 3967)
pnpm dev            # 通常の next dev (CSS 崩れの可能性あり、非推奨)
pnpm build          # 本番ビルド
pnpm start          # ビルド済み成果物を起動 (ポート 3967)
```

## 品質チェック / テスト

```bash
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest (tests/unit/**)
pnpm e2e            # next build + Playwright (tests/e2e/**, ポート 3100)
make ci             # CI と同じ手順 (audit, lint, typecheck, build, vitest, e2e) を一括実行
```

GitHub Actions (`.github/workflows/ci.yml`) は `main` への push と PR で `pnpm install --frozen-lockfile` → audit → lint → typecheck → build → vitest を実行し、最後に未コミット差分が無いことを確認します。

## 商品データ

商品マスタは `src/data/products.yaml` を**唯一のソース**として扱い、Zod でバリデーションした上で `src/data/products.generated.ts` に書き出します。

- 生成スクリプト: `scripts/gen-products.mjs`
- `predev` / `prebuild` で自動実行されるため、通常は手動実行不要
- 手動再生成: `node scripts/gen-products.mjs`

商品 ID は `p_NNN` (3 桁ゼロ埋め)、画像は `public/products/` 以下に配置し、YAML の `image` には `/products/...` から始まるパスを指定します。

## ディレクトリ構成

```
src/
  app/              # App Router 配下のページ
    page.tsx        # トップ
    products/[id]/  # 商品詳細
    categories/[slug]/
    bestsellers/, search/, cart/, checkout/, complete/
    games/, games/[slug]/
  components/
    layout/         # Header / Footer / BannerCarousel / PageShell
    product/        # ProductCard / Grid / Hero / BuyBox / Recommended / Spotlight
    cart/, checkout/, complete/, tweet/
    games/          # Click / Slot / Memory / GameCard / GamesBalance
    ui/             # button / dialog / toast / RatingStars
  lib/              # ドメインロジック (cart, points, slot, click, memory, search, recommend, tweet, storage, ...)
  data/             # products.yaml と生成された products.generated.ts
  types/            # 共有型 (Product / Cart / Game)
public/
  products/, banners/, games/, og/    # 画像・OG・ゲーム素材
scripts/
  gen-products.mjs  # YAML → TS 生成
  dev-watch.mjs     # ローカル開発用ビルド監視
tests/
  unit/             # Vitest
  e2e/              # Playwright
```

## デプロイ

Vercel にデプロイされる前提です。`NEXT_PUBLIC_SITE_URL` を Vercel の環境変数に設定すると、メタデータ・OG・Tweet リンクの URL が連動します。
