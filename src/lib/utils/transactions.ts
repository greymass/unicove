import type { ActionData, ActivityAction, ActivityActionWrapper } from '$lib/types';
import { Checksum256, Name } from '@wharfkit/antelope';

interface IActivityDelegate {
	getActionName: (currentAccount: string, action: ActivityAction) => string;
	getActionData: (currentAccount: string, action: ActivityAction, network: string) => ActionData;
	shouldShow: (currentAccount: string, action: ActivityAction) => boolean;
}

class BaseActivityDelegate implements IActivityDelegate {
	checkReceiver: boolean;

	constructor(checkReceiver = false) {
		this.checkReceiver = checkReceiver;
	}

	getActionName(currentAccount: string, action: ActivityAction): string {
		const name = `${action.contract} - ${action.action}`;
		return `<span class="inline-block px-3 py-0.5 rounded bg-gray-500 text-white">${name}</span>`;
	}

	getActionData(currentAccount: string, action: ActivityAction, network: string): ActionData {
		const records: Array<[string, string]> = Object.entries(action.data).map((item) => {
			let value = item[1];
			let key = String(item[0]);
			let valueStr;
			if (!value) {
				valueStr = '';
			} else if (Array.isArray(value)) {
				valueStr = value.join(',');
			}
			if (typeof value === 'object') {
				valueStr = JSON.stringify(value);
			} else {
				valueStr = String(value);
			}
			return [key, valueStr];
		});
		const memos = records.find((item) => item[0] === 'memo');
		return { records: records, memo: memos ? memos[1] : undefined, src: action.data };
	}

	shouldShow(currentAccount: string, action: ActivityAction) {
		if (this.checkReceiver) return action['raw']['action_trace']['receiver'] === currentAccount;
		return true;
	}

	generateUserSpan(account: string, network: string) {
		return `<a href="/en/${network}/account/${account}/activity" class="text-skyBlue-500">${account}</a>`;
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
			return `<span class="inline-block px-3 py-0.5 rounded bg-gray-500 text-white">${this.actionName}</span>`;
		}
		return super.getActionName(currentAccount, action);
	}

	override getActionData(
		currentAccount: string,
		action: ActivityAction,
		network: string
	): ActionData {
		const data = super.getActionData(currentAccount, action, network);
		let explanation = this.generateActionDataExplanation(currentAccount, action, network);
		if (explanation) data.explanation = explanation;
		return data;
	}

	generateActionDataExplanation(currentAccount: string, action: ActivityAction, network: string) {
		const act = String(action.action);
		let explanation = undefined;
		if ('delegatebw' === act) {
			explanation = `<span class=" text-skyBlue-500">${action.data['from']}</span> delegated to <span class="text-skyBlue-500">${action.data['receiver']}</span> <span class="text-white">${action.data['stake_net_quantity']}</span> for NET and <span class="text-white">${action.data['stake_cpu_quantity']}</span> for CPU`;
		} else if ('undelegatebw' === act) {
			explanation = `<span class=" text-skyBlue-500">${action.data['receiver']}</span> undelegated from <span class="text-skyBlue-500">${action.data['from']}</span> <span class="text-white">${action.data['unstake_net_quantity']}</span> for NET and <span class="text-white">${action.data['unstake_cpu_quantity']}</span> for CPU`;
		} else if ('refund' === act) {
			explanation = `Refund(unstaked) to <span class=" text-skyBlue-500">${action.data['owner']}</span>`;
		}
		return explanation;
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
				return '<span class="inline-block px-3 py-0.5 rounded bg-yellow-500 text-white">Sent Token</span>';
			}
			if (this.isReceiveToken(currentAccount, action)) {
				return '<span class="inline-block px-3 py-0.5 rounded bg-green-500 text-white">Receive Token</span>';
			}
		}

		return super.getActionName(currentAccount, action);
	}

	generateActionDataExplanation(currentAccount: string, action: ActivityAction, network: string) {
		const act = String(action.action);
		let explanation = undefined;
		if (this.isSendToken(currentAccount, action) || this.isReceiveToken(currentAccount, action)) {
			explanation = `${this.generateUserSpan(action.data['from'], network)} &rarr; ${this.generateUserSpan(action.data['to'], network)} <span class=" text-white">${action.data['quantity']}</span>`;
			if (!TransferActivityDelegate.EOSIO_TOKEN.equals(action.contract)) {
				explanation = `${explanation} (<span class=" text-skyBlue-500">${action.contract}</span>)`;
			}
		}
		if (!explanation)
			explanation = super.generateActionDataExplanation(currentAccount, action, network);
		return explanation;
	}

	shouldShow(currentAccount: string, action: ActivityAction) {
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

	getActionName(currentAccount: string, action: ActivityAction): string {
		return `<span class="inline-block px-3 py-0.5 rounded bg-red-500 text-white">${this.actionName}</span>`;
	}

	generateActionDataExplanation(currentAccount: string, action: ActivityAction, network: string) {
		const act = String(action.action);
		let explanation = undefined;
		if ('newaccount' === act) {
			explanation = `New User <span class=" text-skyBlue-500">${action.data['name']}</span> created by <span class="text-skyBlue-500">${action.data['creator']}</span>`;
		}
		if (!explanation)
			explanation = super.generateActionDataExplanation(currentAccount, action, network);
		return explanation;
	}
}

class RamActivityDelegate extends SystemActivityDelegate {
	constructor(actionName: string) {
		super(actionName, true);
	}

	generateActionDataExplanation(currentAccount: string, action: ActivityAction, network: string) {
		const act = String(action.action);
		let explanation = undefined;
		if ('buyrambytes' === act) {
			explanation = `<span class=" text-skyBlue-500">${action.data['payer']}</span> bought <span class="text-white">${action.data['bytes']} bytes</span> RAM for <span class=" text-skyBlue-500">${action.data['receiver']}</span>`;
		} else if ('buyram' === act) {
			explanation = `<span class=" text-skyBlue-500">${action.data['payer']}</span> bought <span class="text-white">${action.data['quant']}</span> RAM for <span class=" text-skyBlue-500">${action.data['receiver']}</span>`;
		} else if ('sellram' === act) {
			explanation = `<span class=" text-skyBlue-500">${action.data['account']}</span> sold <span class="text-white">${action.data['bytes']} bytes</span> RAM`;
		}
		if (!explanation)
			explanation = super.generateActionDataExplanation(currentAccount, action, network);
		return explanation;
	}
}

class RexActivityDelegate extends SystemActivityDelegate {
	constructor(actionName: string) {
		super(actionName, false);
	}

	generateActionDataExplanation(currentAccount: string, action: ActivityAction, network: string) {
		const act = String(action.action);
		let explanation = undefined;
		if ('buyrex' === act) {
			explanation = `<span class=" text-skyBlue-500">${action.data['from']}</span> bought <span class="text-white">${action.data['amount']}</span> of REX`;
		} else if ('sellrex' === act) {
			explanation = `<span class=" text-skyBlue-500">${action.data['from']}</span> sold <span class="text-white">${action.data['rex']}<span>`;
		} else if ('withdraw' === act) {
			explanation = `<span class=" text-skyBlue-500">${action.data['owner']}</span> withdrew <span class="text-white">${action.data['amount']}</span> from REX fund back to liquid`;
		} else if ('mvfrsavings' === act) {
			explanation = `Move <span class="text-white">${action.data['rex']}</span> out of savings bucket`;
		} else if ('mvtosavings' === act) {
			explanation = `Move <span class="text-white">${action.data['rex']}</span> to savings bucket`;
		} else if ('unstaketorex' === act) {
			explanation = `<span class=" text-skyBlue-500">${action.data['owner']}</span> unstake to <span class="text-skyBlue-500">${action.data['receiver']}</span> <span class="text-white">${action.data['from_cpu']}</span> for CPU and <span class="text-white">${action.data['from_net']}</span> for NET`;
		}
		if (!explanation)
			explanation = super.generateActionDataExplanation(currentAccount, action, network);
		return explanation;
	}
}

class VoteActivityDelegate extends SystemActivityDelegate {
	constructor(actionName: string) {
		super(actionName, false);
	}

	getActionName(currentAccount: string, action: ActivityAction): string {
		return `<span class="inline-block px-3 py-0.5 rounded bg-red-500 text-white">${this.actionName}</span>`;
	}

	generateActionDataExplanation(currentAccount: string, action: ActivityAction, network: string) {
		const act = String(action.action);
		let explanation = undefined;
		if ('voteproducer' === act) {
			explanation = `<span class=" text-skyBlue-500">${action.data['voter']}</span> voted through <span class="text-white">proxy</span> <span class="text-skyBlue-500">${action.data['proxy']}</span>`;
		}
		if (!explanation)
			explanation = super.generateActionDataExplanation(currentAccount, action, network);
		return explanation;
	}
}

export const actionDeleates: Record<string, BaseActivityDelegate> = {
	transfer: new TransferActivityDelegate(),

	newaccount: new AuthActivityDelegate('New Account'),
	linkauth: new AuthActivityDelegate('Link Auth'),
	unlinkauth: new AuthActivityDelegate('Unlink Auth'),
	updateauth: new AuthActivityDelegate('Update Auth'),
	deleteauth: new AuthActivityDelegate('Delete Auth'),

	buyrambytes: new RamActivityDelegate('Buy RAM'),
	buyram: new RamActivityDelegate('Buy RAM'),
	sellram: new RamActivityDelegate('Sell RAM'),

	buyrex: new RexActivityDelegate('Buy REX'),
	sellrex: new RexActivityDelegate('Sell REX'),
	withdraw: new RexActivityDelegate('REX Fund Withdraw'),
	mvfrsavings: new RexActivityDelegate('REX Savings Out'),
	mvtosavings: new RexActivityDelegate('REX Savings In'),
	deposit: new RexActivityDelegate('Deposit'),
	rentnet: new RexActivityDelegate('Rent NET'),
	rentcpu: new RexActivityDelegate('Rent CPU'),
	unstaketorex: new RexActivityDelegate('Staked to REX'),

	voteproducer: new VoteActivityDelegate('Vote'),

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
	network: string,
	actions: ActivityAction[]
): ActivityActionWrapper[] {
	let list: ActivityActionWrapper[] = [];
	actions.forEach((action) => {
		let delegate = actionDeleates[String(action.action)];
		if (!delegate) {
			delegate = commonActivityDelegate;
		}
		const shortId = getShortId(action.id);
		const seqId = String(action.raw['account_action_seq']);
		console.log(
			shortId,
			seqId,
			String(action.action),
			', receiver = ',
			action['raw']['action_trace']['receiver'],
			', Same = ',
			currentAcount === action['raw']['action_trace']['receiver']
		);
		if (delegate.shouldShow(currentAcount, action)) {
			list.push(convertActivityAction(currentAcount, network, action, delegate));
		}
	});
	return list;
}
function convertActivityAction(
	currentAcount: string,
	network: string,
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
		actionData: delegate.getActionData(currentAcount, action, network)
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
