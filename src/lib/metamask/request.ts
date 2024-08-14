import type { RequestArguments } from '@metamask/providers';

import { error, snapProvider } from '../state/metamask.svelte';
import { get } from 'svelte/store';

export type Request = (params: RequestArguments) => Promise<unknown | null>;

export const request: Request = async ({ method, params }) => {
	try {
		const data =
			(await get(snapProvider)?.request({
				method,
				params
			} as RequestArguments)) ?? null;

		return data;
	} catch (requestError: any) {
		error.set(requestError);

		return null;
	}
};
