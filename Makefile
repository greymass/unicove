include .env
-include .env.local
-include .env.development
-include .env.production

SHELL := /usr/bin/env bash
BIN := ./node_modules/.bin

ENVS=./scripts/env
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
	$(CONTRACTS)/system.ts
	

$(CONTRACTS)/system.ts:
	bunx @wharfkit/cli generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/system.ts eosio

$(CONTRACTS)/token.ts:
	bunx @wharfkit/cli generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/token.ts eosio.token

$(CONTRACTS)/msig.ts:
	bunx @wharfkit/cli generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/msig.ts eosio.msig

$(CONTRACTS)/delphihelper.ts:
ifeq ($(PUBLIC_FEATURE_DELPHIHELPER),"true")
	bunx @wharfkit/cli generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/delphihelper.ts delphihelper
else
	cp ./configs/contracts/delphihelper.ts $(CONTRACTS)/delphihelper.ts
endif

$(CONTRACTS)/delphioracle.ts:
ifeq ($(PUBLIC_FEATURE_DELPHIORACLE),"true")
	bunx @wharfkit/cli generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/delphioracle.ts delphioracle
else
	cp ./configs/contracts/delphioracle.ts $(CONTRACTS)/delphioracle.ts
endif

$(CONTRACTS)/unicove.ts:
ifeq ($(PUBLIC_FEATURE_UNICOVECONTRACTS),"true")
	bunx @wharfkit/cli generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/unicove.ts unicove.gm
else
	cp ./configs/contracts/unicove.ts $(CONTRACTS)/unicove.ts
endif

$(CONTRACTS)/eosntime.ts:
ifeq ($(PUBLIC_FEATURE_EOSNTIME),"true")
	bunx @wharfkit/cli generate -u $(PUBLIC_API_CHAIN) -f $(CONTRACTS)/eosntime.ts time.eosn
else
	cp ./configs/contracts/eosntime.ts $(CONTRACTS)/eosntime.ts
endif

codegen: $(CONTRACTS)/system.ts $(CONTRACTS)/token.ts $(CONTRACTS)/msig.ts $(CONTRACTS)/delphihelper.ts $(CONTRACTS)/delphioracle.ts $(CONTRACTS)/unicove.ts $(CONTRACTS)/eosntime.ts
	mkdir -p $(CONTRACTS)

.PHONY: clean
codegen/clean:
	rm -rf $(CONTRACTS)/*.ts

config/eos: codegen/clean codegen
	cp ./configs/.env.eos .env.local

config/jungle4: codegen/clean codegen
	cp ./configs/.env.jungle4 .env.local

config/kylin: codegen/clean codegen
	cp ./configs/.env.kylin .env.local

config/telos: codegen/clean codegen
	cp ./configs/.env.telos .env.local