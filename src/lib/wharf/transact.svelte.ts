import { SignedTransaction, type Checksum256, type Transaction } from '@wharfkit/antelope';
import type { API, TransactArgs, TransactOptions, TransactResult } from '@wharfkit/session';
import { wharf } from './service.svelte';

enum StatusType {
	CREATED = 'CREATED',
	SIGNED = 'SIGNED',
	BROADCAST = 'BROADCAST',
	INBLOCK = 'INBLOCK',
	IRREVERSIBLE = 'IRREVERSIBLE',
	ERROR = 'ERROR'
}

export interface QueuedTransaction {
	status: StatusType;
	args: TransactArgs;
	options?: TransactOptions;
	response?: API.v1.SendTransaction2Response;
	transaction?: Transaction;
	error?: string;
}

export const transactions = $state<QueuedTransaction[]>([]);

export async function transact(
	args: TransactArgs,
	options?: TransactOptions
): Promise<TransactResult | undefined> {
	if (!wharf.session) {
		throw new Error('No active session available to transact with.');
	}
	console.log('global transact', args, options);
	const transaction: QueuedTransaction = {
		status: StatusType.CREATED,
		args,
		options
	};

	const result = await wharf.session
		.transact(args, {
			...options,
			broadcast: false
		})
		.catch((e: Error) => {
			transaction.status = StatusType.ERROR;
			transaction.error = String(e);
			transactions.push(transaction);
			throw e;
		});

	if (!result || !result.resolved) {
		transactions.push(transaction);
		throw new Error('Transaction was not resolved.');
	}

	transaction.status = StatusType.SIGNED;
	transaction.transaction = result.resolved.transaction;

	if (!options || options.broadcast) {
		const signedTransaction = SignedTransaction.from({
			...result.resolved.transaction,
			signatures: result.signatures
		});
		const response = await wharf.session.client.v1.chain
			.send_transaction(signedTransaction)
			.catch((e: Error) => {
				transaction.status = StatusType.ERROR;
				transaction.error = String(e);
				transactions.push(transaction);
				throw e;
			});
		transaction.response = response;
	}

	transactions.push(transaction);
	return result;
}
