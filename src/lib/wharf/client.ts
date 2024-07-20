import { APIClient, FetchProvider } from '@wharfkit/antelope';

export function getClient(fetch: typeof window.fetch) {
	return new APIClient({ provider: new FetchProvider('https://jungle4.greymass.com', { fetch }) });
}
