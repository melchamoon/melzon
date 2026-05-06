.PHONY: run-dev run-dev-hmr lint test ci

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
