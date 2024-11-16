import type { RequestArguments } from '@metamask/providers';

import type { MetaMaskState } from './state/metamask.svelte';

export type Request = (params: RequestArguments) => Promise<unknown | null>;

/**
 * Check if a snap ID is a local snap ID.
 *
 * @param snapId - The snap ID.
 * @returns True if it's a local Snap, or false otherwise.
 */
export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');

export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
	permissionName: string;
	id: string;
	version: string;
	initialPermissions: Record<string, unknown>;
};

/**
 * Get the Snap information from MetaMask.
 */
export const setSnap = async (metaMaskState: MetaMaskState) => {
	const snaps = (await request(
		{
			method: 'wallet_getSnaps'
		},
		metaMaskState
	)) as GetSnapsResponse;

	metaMaskState.installedSnap = snaps[metaMaskState.snapOrigin || ''] ?? null;
};

/**
 * Utility hook to wrap the `wallet_requestSnaps` method.
 *
 * @param id - The requested Snap ID. Defaults to the snap ID specified in the config.
 * @param version - The requested version.
 * @returns The `wallet_requestSnaps` wrapper.
 */
export const requestSnap = async (metaMaskState: MetaMaskState, version?: string) => {
	const snapId = metaMaskState.snapOrigin;

	if (!snapId) {
		throw new Error('Snap ID is needed to request snap.');
	}

	try {
		const snaps = (await request(
			{
				method: 'wallet_requestSnaps',
				params: {
					[snapId]: version ? { version } : {}
				}
			},
			metaMaskState
		)) as Record<string, Snap>;

		metaMaskState.installedSnap = snaps?.[snapId] ?? null;
	} catch (error) {
		alert(`Error requesting "${snapId}" snap. Error: ${(error as { message: string }).message}`);
	}
};

export type InvokeSnapParams = {
	method: string;
	params?: Record<string, unknown>;
};

/** Invoke the requested Snap `wallet_invokeSnap` method.
 *
 * @param params - The invoke params.
 * @param params.method - The method name.
 * @param params.params - The method params.
 * @param id -  The Snap ID to invoke. Defaults to the snap ID specified in the
 * @returns The Snap response.
 */
export const invokeSnap = async (
	{ method, params }: InvokeSnapParams,
	id: string,
	metaMaskState: MetaMaskState
) => {
	const snapId = id;
	return request(
		{ method: 'wallet_invokeSnap', params: { snapId, request: { method, params } } },
		metaMaskState
	);
};

interface RequestState {
	method: string;
	params?: Record<string, unknown>;
}

const request = async ({ method, params }: RequestState, metaMaskState: MetaMaskState) => {
	return metaMaskState.snapProvider?.request({
		method,
		params
	} as RequestArguments);
};
