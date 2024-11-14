import type { ActivityAction, ActivityActionWrapper } from '$lib/types';
import { Checksum256, Name } from '@wharfkit/antelope';

interface IActivityDelegate {
	getActionName: (currentAccount: string, action: ActivityAction) => string;
	isMyActionTrace: (currentAccount: string, action: ActivityAction) => boolean;
}

class BaseActivityDelegate implements IActivityDelegate {
	checkReceiver: boolean;

	constructor(checkReceiver = false) {
		this.checkReceiver = checkReceiver;
	}

	getActionName(currentAccount: string, action: ActivityAction): string {
		const name = `${action.contract} - ${action.action}`;
		return `<span class="inline-block px-3 py-0.5 rounded bg-mineShaft-500 text-white">${name}</span>`;
	}

	isMyActionTrace(currentAccount: string, action: ActivityAction) {
		if (this.checkReceiver) return action['raw']['action_trace']['receiver'] === currentAccount;
		return true;
	}
}

class SystemActivityDelegate extends BaseActivityDelegate {
	static EOSIO = Name.from('eosio');

	protected actionName: string;

	constructor(actionName: string, checkReceiver = false) {
		super(checkReceiver);
		this.actionName = actionName;
	}

	override getActionName(currentAccount: string, action: ActivityAction): string {
		if (SystemActivityDelegate.EOSIO.equals(action.contract)) {
			return `<span class="inline-block px-3 py-0.5 rounded bg-mineShaft-500 text-white">${this.actionName}</span>`;
		}
		return super.getActionName(currentAccount, action);
	}
}

class TransferActivityDelegate extends SystemActivityDelegate {
	static EOSIO_TOKEN = Name.from('eosio.token');

	constructor() {
		super('transfer', true);
	}

	isSendToken(currentAccount: string, action: ActivityAction): boolean {
		return currentAccount === action.data['from'];
	}

	isReceiveToken(currentAccount: string, action: ActivityAction): boolean {
		return currentAccount === action.data['to'];
	}

	getActionName(currentAccount: string, action: ActivityAction): string {
		if (TransferActivityDelegate.EOSIO_TOKEN.equals(action.contract)) {
			if (this.isSendToken(currentAccount, action)) {
				return '<span class="inline-block px-3 py-0.5 rounded bg-solar-500 text-white">Sent Token</span>';
			}
			if (this.isReceiveToken(currentAccount, action)) {
				return '<span class="inline-block px-3 py-0.5 rounded bg-green-500 text-white">Receive Token</span>';
			}
		}

		return super.getActionName(currentAccount, action);
	}

	override isMyActionTrace(currentAccount: string, action: ActivityAction) {
		if (this.isSendToken(currentAccount, action) || this.isReceiveToken(currentAccount, action)) {
			return action['raw']['action_trace']['receiver'] === currentAccount;
		}
		return false;
	}
}

class AuthActivityDelegate extends SystemActivityDelegate {
	constructor(actionName: string) {
		super(actionName, false);
	}

	override getActionName(currentAccount: string, action: ActivityAction): string {
		return `<span class="inline-block px-3 py-0.5 rounded bg-red-500 text-white">${this.actionName}</span>`;
	}
}

class VoteActivityDelegate extends SystemActivityDelegate {
	constructor(actionName: string) {
		super(actionName, false);
	}

	override getActionName(currentAccount: string, action: ActivityAction): string {
		return `<span class="inline-block px-3 py-0.5 rounded bg-red-500 text-white">${this.actionName}</span>`;
	}
}

export const actionDeleates: Record<string, BaseActivityDelegate> = {
	transfer: new TransferActivityDelegate(),

	newaccount: new AuthActivityDelegate('New Account'),
	linkauth: new AuthActivityDelegate('Link Auth'),
	unlinkauth: new AuthActivityDelegate('Unlink Auth'),
	updateauth: new AuthActivityDelegate('Update Auth'),
	deleteauth: new AuthActivityDelegate('Delete Auth'),

	voteproducer: new VoteActivityDelegate('Vote'),

	buyrambytes: new SystemActivityDelegate('Buy RAM', true),
	buyram: new SystemActivityDelegate('Buy RAM', true),
	sellram: new SystemActivityDelegate('Sell RAM', true),
	buyrex: new SystemActivityDelegate('Buy REX'),
	sellrex: new SystemActivityDelegate('Sell REX'),
	withdraw: new SystemActivityDelegate('REX Fund Withdraw'),
	mvfrsavings: new SystemActivityDelegate('REX Savings Out'),
	mvtosavings: new SystemActivityDelegate('REX Savings In'),
	deposit: new SystemActivityDelegate('Deposit'),
	rentnet: new SystemActivityDelegate('Rent NET'),
	rentcpu: new SystemActivityDelegate('Rent CPU'),
	unstaketorex: new SystemActivityDelegate('Staked to REX'),
	delegatebw: new SystemActivityDelegate('Delegate'),
	undelegatebw: new SystemActivityDelegate('Undelegate'),
	refund: new SystemActivityDelegate('Refund'),
	claimrewards: new SystemActivityDelegate('Claim Rewards'),
	regproducer: new SystemActivityDelegate('Reg Producer'),
	unregprod: new SystemActivityDelegate('Unreg Producer')
};

const commonActivityDelegate = new BaseActivityDelegate();

export function convertActivityActions(
	currentAcount: string,
	actions: ActivityAction[]
): ActivityActionWrapper[] {
	let list: ActivityActionWrapper[] = [];
	actions.forEach((action) => {
		let delegate = actionDeleates[String(action.action)];
		if (!delegate) {
			delegate = commonActivityDelegate;
		}
		if (delegate.isMyActionTrace(currentAcount, action)) {
			list.push(convertActivityAction(currentAcount, action, delegate));
		}
	});
	return list;
}
function convertActivityAction(
	currentAcount: string,
	action: ActivityAction,
	delegate: BaseActivityDelegate
): ActivityActionWrapper {
	const shortId = getShortId(action.id);
	const seqId = String(action.raw['account_action_seq']);
	const date = action.timestamp.toDate();
	const dateTime = getDateTime(date);
	const timeInDay = getDayTime(date);

	return {
		src: action,
		id: String(action.id),
		shortId: shortId,
		seqId: seqId,
		date: dateTime,
		timeInDay: timeInDay,
		actionName: delegate.getActionName(currentAcount, action),
		actionData: action.data,
	};
}

function getShortId(id: Checksum256) {
	return String(id).substring(0, 7);
}

function getDateTime(date: Date) {
	const year = date.getFullYear().toString().slice(-2);
	const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
	const day = date.getDate().toString();
	return `${day} ${month} ${year}`;
}

function getDayTime(date: Date) {
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
}
