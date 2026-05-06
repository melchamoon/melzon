.PHONY: run lint test ci

run:
	pnpm dev

lint:
	pnpm lint
	pnpm typecheck

test:
	pnpm test -- --run
	pnpm e2e

ci:
	pnpm install --frozen-lockfile
	pnpm audit --audit-level=high
	pnpm build
	$(MAKE) lint
	pnpm test -- --run
	CI=true pnpm e2e
