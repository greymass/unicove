import type { RequestHandler } from '@sveltejs/kit';

/**
 * Handles the GET request and generates an XML sitemap for the website.
 */
export const GET: RequestHandler = async ({ request }) => {
	try {
		const protocol = import.meta.env.VITE_SITE_PROTOCOL || 'https';
		const host = request.headers.get('host') || import.meta.env.VITE_SITE_HOST || 'unicove.com';

		// Supported languages and networks
		const LANGS = ['en', 'zh', 'ko'];
		const NETWORKS = ['vaulta']; // Add more as needed

		// Pages to include per language-network combination
		const baseRoutes = ['/', '/send', '/staking', '/ram', '/settings'];

		// Expand routes
		const pages: string[] = [];
		for (const lang of LANGS) {
			for (const network of NETWORKS) {
				for (const route of baseRoutes) {
					// Ensure we don’t end up with double slashes like /en/jungle4/
					const fullPath = route === '/' ? `/${lang}/${network}` : `/${lang}/${network}${route}`;
					pages.push(fullPath);
				}
			}
		}

		// Construct sitemap XML
		const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map(
		(page) => `<url>
  <loc>${protocol}://${host}${page}</loc>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>`
	)
	.join('\n')}
</urlset>`;

		return new Response(xmlContent, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=86400' // Cache for 1 day
			}
		});
	} catch (error) {
		console.error('Error generating sitemap:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};
