interface Env {
	ZONE_ID: string;
	WEBHOOK_SECRET: string;
	PURGE_TOKEN: string;
}

interface ExecutionContext {
	waitUntil(promise: Promise<unknown>): void;
}

const REPURGE_DELAY_MS = 25_000;

async function digest(value: string): Promise<ArrayBuffer> {
	return crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
}

async function authorized(request: Request, env: Env): Promise<boolean> {
	const provided = request.headers.get('cf-webhook-auth');
	if (!provided || !env.WEBHOOK_SECRET) return false;
	const [a, b] = await Promise.all([digest(provided), digest(env.WEBHOOK_SECRET)]);
	return (
		crypto.subtle as SubtleCrypto & { timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean }
	).timingSafeEqual(a, b);
}

async function purge(env: Env, label: string): Promise<void> {
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/zones/${env.ZONE_ID}/purge_cache`,
		{
			method: 'POST',
			headers: {
				authorization: `Bearer ${env.PURGE_TOKEN}`,
				'content-type': 'application/json'
			},
			// Host purges miss the SvelteKit adapter's Cache API copies; purge_everything clears them
			body: JSON.stringify({ purge_everything: true })
		}
	);
	const result = await response.text();
	console.log(`${label} purge ${response.status}: ${result}`);
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
		if (!(await authorized(request, env))) return new Response('Unauthorized', { status: 401 });

		const payload = await request.text();
		console.log(`notification: ${payload}`);

		ctx.waitUntil(
			(async () => {
				await purge(env, 'immediate');
				// A deploy can still be switching over when the success notification arrives
				await new Promise((resolve) => setTimeout(resolve, REPURGE_DELAY_MS));
				await purge(env, 'delayed');
			})()
		);

		return new Response('Accepted', { status: 202 });
	}
};
