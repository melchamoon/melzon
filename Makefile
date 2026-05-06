.PHONY: run lint test ci

run:
	pnpm dev

lint:
	pnpm lint
	pnpm typecheck

test:
	pnpm exec vitest run
	pnpm e2e

ci:
	pnpm install --frozen-lockfile
	pnpm audit --audit-level=high
	pnpm build
	$(MAKE) lint
	pnpm exec vitest run
	CI=true pnpm e2e
