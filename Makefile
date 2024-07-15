SHELL := /bin/bash
BIN := ./node_modules/.bin

.PHONY: dev
dev: node_modules
	bun run dev

.PHONY: check
check: node_modules
	bun run check

.PHONY: format
format: node_modules
	bun run format

node_modules:
	bun install --yarn