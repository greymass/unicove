import * as publicEnv from '$env/static/public';

const optionalEnv = publicEnv as Partial<Record<string, string>>;
const requested = optionalEnv.PUBLIC_VP_BRANCH ?? 'master';
export const VP_BRANCH = /^[A-Za-z0-9._-]+$/.test(requested) ? requested : 'master';
export const RAW_BASE = `https://raw.githubusercontent.com/greymass/vaulta-proposals/${VP_BRANCH}/`;

const REPO_BASE = 'https://github.com/greymass/vaulta-proposals';

export function vpSourceUrl(slug: string): string {
	return `${REPO_BASE}/tree/${VP_BRANCH}/proposals/${slug}`;
}

export function vpStandardUrl(standard: string): string {
	return `${REPO_BASE}/blob/${VP_BRANCH}/standard/${standard}.md`;
}

export type VpHref = { kind: 'internal' | 'external' | 'plain'; href: string };

const CROSS_VP = /^\.\.\/vp-(\d{4})(?:-[a-z0-9-]+)?\/proposal(?:\.[a-z-]+)?\.md(#[^\s]*)?$/;
const SAFE_ANCHOR = /^#[\p{L}\p{N}_-]+$/u;
const ASSET = /^assets\/([A-Za-z0-9._-]+)$/;
const PINNED_GITHUB =
	/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:blob|tree)\/[0-9a-f]{40}\/[a-zA-Z0-9._/#%-]+$/;

const IMAGE_EXTENSION = /\.(?:png|jpg|webp|svg)$/i;

export function rewriteVpHref(href: string, ctx: { slug: string; basePath: string }): VpHref {
	const target = href.trim();

	if (target.startsWith('#')) {
		return SAFE_ANCHOR.test(target)
			? { kind: 'internal', href: target }
			: { kind: 'plain', href: '' };
	}

	const cross = CROSS_VP.exec(target);
	if (cross) {
		const rawAnchor = cross[2] ?? '';
		const anchor = rawAnchor && SAFE_ANCHOR.test(rawAnchor) ? rawAnchor : '';
		return { kind: 'internal', href: `${ctx.basePath}/vp-${cross[1]}${anchor}` };
	}

	const asset = ASSET.exec(target);
	if (asset) {
		return { kind: 'external', href: `${RAW_BASE}proposals/${ctx.slug}/assets/${asset[1]}` };
	}

	if (PINNED_GITHUB.test(target)) {
		return { kind: 'external', href: target };
	}

	return { kind: 'plain', href: target };
}

/** Resolves an image source to a proposal asset URL, or null when the source is anything else. */
export function resolveVpImageSrc(
	src: string,
	ctx: { slug: string; basePath: string }
): string | null {
	const assetPrefix = `${RAW_BASE}proposals/${ctx.slug}/assets/`;
	const resolved = rewriteVpHref(src, ctx);
	if (resolved.kind !== 'external' || !resolved.href.startsWith(assetPrefix)) {
		return null;
	}
	return IMAGE_EXTENSION.test(resolved.href) ? resolved.href : null;
}
