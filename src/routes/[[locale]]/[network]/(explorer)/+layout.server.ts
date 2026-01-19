import { getCacheHeaders } from '$lib/utils/index.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ setHeaders }) => setHeaders(getCacheHeaders(0));
