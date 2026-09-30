#!/bin/sh
set -eu

src=build/client/_app/immutable
version_file=build/client/_app/version.json
dest=${ASSET_STORE:-/assets}
keep=${ASSET_RETAIN_BUILDS:-20}
manifests=$dest/.manifests

if [ -d "$dest" ] && [ -d "$src" ] && [ -f "$version_file" ]; then
	version=$(sed 's/.*"version" *: *"\([^"]*\)".*/\1/' "$version_file")

	find "$src" -type f | while IFS= read -r file; do
		target="$dest/${file#"$src"/}"
		[ -f "$target" ] && continue
		mkdir -p "$(dirname "$target")"
		# Rename so nginx never reads a partially written file from a sibling container
		tmp="$target.tmp.$$"
		cp "$file" "$tmp" && mv -f "$tmp" "$target"
	done

	mkdir -p "$manifests"
	find "$src" -type f | sed "s|^$src/||" | sort > "$manifests/.$version.tmp.$$"
	mv -f "$manifests/.$version.tmp.$$" "$manifests/$version"

	# Retention is per build, not per day: deploys may be months apart
	ls -t "$manifests" | tail -n "+$((keep + 1))" | while IFS= read -r stale; do
		rm -f "$manifests/$stale"
	done

	keeplist=$(mktemp)
	present=$(mktemp)
	ls -t "$manifests" | while IFS= read -r manifest; do cat "$manifests/$manifest"; done | sort -u > "$keeplist"
	find "$dest" -type f -not -path "$manifests/*" | sed "s|^$dest/||" | sort > "$present"
	comm -23 "$present" "$keeplist" | while IFS= read -r orphan; do
		rm -f "$dest/$orphan"
	done
	rm -f "$keeplist" "$present"

	find "$dest" -mindepth 1 -type d -empty -delete
fi

exec bun build/index.js
