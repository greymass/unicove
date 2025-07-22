import { json, error as svelteKitError } from '@sveltejs/kit';
import { generateJwt } from '@coinbase/cdp-sdk/auth';
import type { RequestHandler } from './$types';
import { COINBASE_API_KEY_NAME, COINBASE_API_KEY_SECRET } from '$env/static/private';

const ONRAMP_TOKEN_HOST = 'api.developer.coinbase.com';
const ONRAMP_TOKEN_PATH = '/onramp/v1/token';

export const POST: RequestHandler = async ({ request }) => {
	const { address, assets } = await request.json();

	if (!address || !assets) {
		throw svelteKitError(400, 'Address and assets are required');
	}

	if (!COINBASE_API_KEY_NAME || !COINBASE_API_KEY_SECRET) {
		console.error('Coinbase API credentials are not set in .env');
		throw svelteKitError(500, 'On-ramp service is not configured correctly.');
	}

	try {
		const jwt = await generateJwt({
			apiKeyId: COINBASE_API_KEY_NAME,
			apiKeySecret: COINBASE_API_KEY_SECRET,
			requestMethod: 'POST',
			requestHost: ONRAMP_TOKEN_HOST,
			requestPath: ONRAMP_TOKEN_PATH
		});

		const response = await fetch(`https://${ONRAMP_TOKEN_HOST}${ONRAMP_TOKEN_PATH}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwt}`
			},
			body: JSON.stringify({
				addresses: [
					{
						address: address,
						blockchains: ['eosio'] // Encompasses all unicove supported chains
					}
				],
				assets: assets
			})
		});

		if (!response.ok) {
			const errorBody = await response.text();
			console.error('Failed to get session token from Coinbase:', response.status, errorBody);
			throw svelteKitError(502, 'Failed to communicate with the on-ramp provider.');
		}

		const responseData = await response.json();
		const sessionToken = responseData.token;

		return json({ token: sessionToken });
	} catch (e) {
		console.error('Error generating Coinbase session token:', e);
		throw svelteKitError(500, 'An unexpected error occurred.');
	}
};
