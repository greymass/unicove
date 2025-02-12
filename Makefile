include .env

SHELL := /usr/bin/env bash
BIN := ./node_modules/.bin
CONTRACTS=./src/lib/wharf/contracts

.PHONY: dev
dev: node_modules codegen
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
		bun install --frozen-lockfile; \
	else \
		echo "Installing package: $(package)"; \
		bun install --frozen-lockfile $(package); \
	fi

$(CONTRACTS)/system.ts:
	bunx @wharfkit/cli generate -u $(CONTRACTS_API) -f $(CONTRACTS)/system.ts eosio

$(CONTRACTS)/token.ts:
	bunx @wharfkit/cli generate -u $(CONTRACTS_API) -f $(CONTRACTS)/token.ts eosio.token

$(CONTRACTS)/msig.ts:
	bunx @wharfkit/cli generate -u $(CONTRACTS_API) -f $(CONTRACTS)/msig.ts eosio.msig

$(CONTRACTS)/delphioracle.ts:
	bunx @wharfkit/cli generate -u $(CONTRACTS_API) -f $(CONTRACTS)/delphioracle.ts delphioracle

$(CONTRACTS)/unicove.ts:
	bunx @wharfkit/cli generate -u $(CONTRACTS_API) -f $(CONTRACTS)/unicove.ts unicove.gm

codegen: $(CONTRACTS)/system.ts $(CONTRACTS)/token.ts $(CONTRACTS)/msig.ts $(CONTRACTS)/delphioracle.ts $(CONTRACTS)/unicove.ts
	mkdir -p $(CONTRACTS)

.PHONY: clean
codegen/clean:
	rm -rf $(CONTRACTS)/*.ts

config:
	bun run scripts/env/env.ts

config/custom:
	cp ./scripts/env/default/* ./scripts/env/custom
