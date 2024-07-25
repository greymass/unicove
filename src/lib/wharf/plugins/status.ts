import {
	AbstractTransactPlugin,
	API,
	Checksum256,
	TransactContext,
	type TransactHookResponseType,
	TransactHookTypes,
	type TransactResult
} from '@wharfkit/session';

import { StatusType, updateStatus } from '../transact.svelte';

export class TransactPluginStatusEmitter extends AbstractTransactPlugin {
	logging: boolean = true;

	/** A unique ID for this plugin */
	id = 'transact-plugin-status-emitter';

	register(context: TransactContext): void {
		context.addHook(TransactHookTypes.afterBroadcast, this._register);
	}

	_register(result: TransactResult, context: TransactContext): Promise<TransactHookResponseType> {
		const { resolved } = result;
		if (!resolved) {
			throw Error(
				'Resolved Request not returned on afterBroadcast hook. This value is needed for the Finality Callback plugin to work.'
			);
		}
		checkStatus(resolved.transaction.id, context);
		return Promise.resolve();
	}
}

async function checkStatus(
	transactionId: Checksum256,
	context: TransactContext
): Promise<API.v1.GetTransactionStatusResponse> {
	return new Promise((resolve, reject) => {
		context.client.v1.chain
			.get_transaction_status(transactionId)
			.then((response) => {
				switch (response.state) {
					case 'IRREVERSIBLE':
						updateStatus(transactionId, StatusType.IRREVERSIBLE);
						return resolve(response);
					case 'LOCALLY_APPLIED':
					case 'IN_BLOCK':
						updateStatus(transactionId, StatusType[response.state]);
						break;
					default:
						console.log(
							'Unknown state returned from get_transaction_status',
							response.state,
							JSON.stringify(response)
						);
						break;
				}
				setTimeout(() => {
					checkStatus(transactionId, context).then(resolve).catch(reject);
				}, 5000);
			})
			.catch((error) => {
				if (error.response && error.response.status === 404) {
					setTimeout(() => {
						checkStatus(transactionId, context).then(resolve).catch(reject);
					}, 5000);
				} else if (error.response.status === 500) {
					reject(`The API returned an error: ${error}`);
				} else {
					reject(error);
				}
			});
	});
}
