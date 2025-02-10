API_EOS_CHAIN ?= https://eos.greymass.com
SHELL := /usr/bin/env bash
BIN := ./node_modules/.bin

.PHONY: dev
dev: node_modules
	bun run dev --host 

.PHONY: check
check: node_modules
	bun run check && bun run lint

.PHONY: format
format: node_modules
	bun run format

.PHONY: install
install:
	@if [ -z "$(package)" ]; then \
		echo "Installing all dependencies:"; \
		bun install --yarn --frozen-lockfile; \
	else \
		echo "Installing package: $(package)"; \
		bun install --yarn --frozen-lockfile $(package); \
	fi

codegen:
	npx @wharfkit/cli generate -u $(API_EOS_CHAIN) -f src/lib/wharf/contracts/system.ts eosio
	npx @wharfkit/cli generate -u $(API_EOS_CHAIN) -f src/lib/wharf/contracts/token.ts eosio.token
	npx @wharfkit/cli generate -u $(API_EOS_CHAIN) -f src/lib/wharf/contracts/msig.ts eosio.msig
	npx @wharfkit/cli generate -u $(API_EOS_CHAIN) -f src/lib/wharf/contracts/delphioracle.ts delphioracle
	npx @wharfkit/cli generate -u $(API_EOS_CHAIN) -f src/lib/wharf/contracts/unicove.ts unicove.gm

config:
	bun run scripts/env/env.ts

config/custom:
	cp ./scripts/env/default/* ./scripts/env/custom
