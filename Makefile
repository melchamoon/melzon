.PHONY: run-dev run-dev-hmr build start build-start lint test ci

# 本番ビルド（再ビルド不要な実行用）
build:
	pnpm build

# ビルド済み成果物を起動（コード変更があっても再ビルドしない）
start:
	pnpm start

# ビルドして即起動
build-start: build start

# ファイル変更検知 → フルビルド → サーバー再起動
run-dev:
	pnpm run dev:build

# HMR方式 (CSS問題あり、現在非推奨)
run-dev-hmr:
	pnpm dev

lint:
	pnpm lint
	pnpm typecheck

test:
	pnpm exec vitest run
	pnpm build
	pnpm e2e

ci:
	pnpm install --frozen-lockfile
	pnpm audit --audit-level=high
	pnpm build
	$(MAKE) lint
	pnpm exec vitest run
	CI=true pnpm e2e
