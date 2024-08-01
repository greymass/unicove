import { type Checksum256, type Transaction } from '@wharfkit/antelope';
import type { TransactArgs, TransactOptions, TransactResult } from '@wharfkit/session';
import { getWharf } from './service.svelte';
import { TransactPluginStatusEmitter } from './plugins/status';
import { addToast, updateToast } from '../state/toaster.svelte';

const wharf = getWharf();

export enum StatusType {
	CREATED = 'CREATED',
	BROADCAST = 'BROADCAST',
	LOCALLY_APPLIED = 'LOCALLY_APPLIED',
	IN_BLOCK = 'IN_BLOCK',
	IRREVERSIBLE = 'IRREVERSIBLE',
	ERROR = 'ERROR'
}

export interface QueuedTransaction {
	status: StatusType;
	args: TransactArgs;
	options?: TransactOptions;
	response?: any;
	transaction?: Transaction;
	error?: string;
	toastId?: string;
}

export const transactions = $state<QueuedTransaction[]>([]);

export function updateStatus(id: Checksum256, status: StatusType) {
	const index = transactions.findIndex((t) => t.transaction?.id.equals(id));
	if (index >= 0) {
		const tx = transactions[index];
		tx.status = status;

		if (tx.toastId) {
			updateToast(tx.toastId, {
				title: tx.status,
				description: String(tx.transaction?.id),
				color: 'bg-green-200'
			});
		}

		if (tx.toastId && status === StatusType.IRREVERSIBLE) {
			sendSuccessToast(tx);
		}
	} else {
		console.error('Unable to find transaction in queue', String(id));
	}
}

export async function transact(
	args: TransactArgs,
	options?: TransactOptions
): Promise<TransactResult | undefined> {
	if (!wharf.session) {
		throw new Error('No active session available to transact with.');
	}

	const transaction: QueuedTransaction = {
		status: StatusType.CREATED,
		args,
		options
	};

	const result = await wharf.session
		.transact(args, {
			...options,
			transactPlugins: [new TransactPluginStatusEmitter()]
		})
		.catch((e: Error) => {
			transaction.status = StatusType.ERROR;
			transaction.error = String(e);
			transactions.push(transaction);
			const { id } = sendErrorToast(transaction);
			transaction.toastId = id;
			throw e;
		});

	if (!result.resolved || !result.response) {
		transaction.status = StatusType.ERROR;
		transaction.error = 'Transaction was not resolved.';
		const { id } = sendErrorToast(transaction);
		transaction.toastId = id;

		transactions.push(transaction);
		throw new Error('Transaction was not resolved.');
	}

	transaction.status = StatusType.BROADCAST;
	transaction.response = result.response;
	transaction.transaction = result.resolved.transaction;
	const { id } = sendSuccessToast(transaction);
	transaction.toastId = id;
	transactions.push(transaction);

	return result;
}

function sendErrorToast(tx: QueuedTransaction) {
	return addToast({
		data: {
			title: tx.status,
			description: String(tx.error),
			color: 'bg-red-200'
		},
		closeDelay: 5000
	});
}

function sendSuccessToast(tx: QueuedTransaction) {
	return addToast({
		data: {
			title: tx.status,
			description: String(tx.transaction?.id),
			color: 'bg-green-200'
		},
		closeDelay: 5000
	});
}
