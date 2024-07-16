import { APIClient } from '@wharfkit/antelope';
import { browser } from '$app/environment';

import { chain } from '.';

export let apiUrl: string = chain.url;
if (browser) {
	const urlParams = new URLSearchParams(window.location.search);
	apiUrl = urlParams.get('url') ? urlParams.get('url') : chain.url;
	chain.url = apiUrl;
}

export const client = new APIClient({ url: apiUrl });
