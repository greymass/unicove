import type { RequestArguments } from '@metamask/providers';

import { snapProvider, installedSnap } from './state/metamask.svelte';
import { get } from 'svelte/store';

export type Request = (params: RequestArguments) => Promise<unknown | null>;

import { PUBLIC_SNAP_ORIGIN } from '$env/static/public';
/**
 * The snap origin to use.
 * Will default to the local hosted snap if no value is provided in environment.
 *
 * You may be tempted to change this to the URL where your production snap is hosted, but please
 * don't. Instead, rename `.env.production.dist` to `.env.production` and set the production URL
 * there. Running `yarn build` will automatically use the production environment variables.
 */
export const defaultSnapOrigin = PUBLIC_SNAP_ORIGIN
	? PUBLIC_SNAP_ORIGIN
	: `local:http://localhost:8080`;

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
export const setSnap = async () => {
	const snaps = (await request({
		method: 'wallet_getSnaps'
	})) as GetSnapsResponse;

	installedSnap.set(snaps[defaultSnapOrigin] ?? null);
};

/**
 * Utility hook to wrap the `wallet_requestSnaps` method.
 *
 * @param id - The requested Snap ID. Defaults to the snap ID specified in the config.
 * @param version - The requested version.
 * @returns The `wallet_requestSnaps` wrapper.
 */
export const requestSnap = async (id?: string, version?: string) => {
	const snapId = id || defaultSnapOrigin;

	try {
		const snaps = (await request({
			method: 'wallet_requestSnaps',
			params: {
				[snapId]: version ? { version } : {}
			}
		})) as Record<string, Snap>;

		installedSnap.set(snaps?.[snapId] ?? null);
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
export const invokeSnap = async ({ method, params }: InvokeSnapParams, id?: string) => {
	const snapId = id || defaultSnapOrigin;
	return request({ method: 'wallet_invokeSnap', params: { snapId, request: { method, params } } });
};

const request: Request = async ({ method, params }) => {
	return get(snapProvider)?.request({
		method,
		params
	} as RequestArguments);
};
