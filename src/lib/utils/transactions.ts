import type { ActionData, ActivityAction, ActivityActionWrapper } from '$lib/types';
import { Checksum256, Name } from '@wharfkit/antelope';
import { languageTag } from '$lib/paraglide/runtime.js';

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
		return `<span class="inline-block px-3 py-0.5 rounded bg-mineShaft-500 text-white">${name}</span>`;
	}

	getActionData(currentAccount: string, action: ActivityAction, network: string): ActionData {
		const memo = action.data['memo'];
		return { memo: memo, json: action.data };
	}

	shouldShow(currentAccount: string, action: ActivityAction) {
		if (this.checkReceiver) return action['raw']['action_trace']['receiver'] === currentAccount;
		return true;
	}

	generateUserSpan(account: string, network: string) {
		return `<a href="/${languageTag()}/${network}/account/${account}/activity" class="text-skyBlue-500">${account}</a>`;
	}

	generateWhiteTextSpan(account: string) {
		return `<span class="text-white">${account}</span>`;
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
			explanation = `${this.generateUserSpan(action.data['from'], network)} delegated to ${this.generateUserSpan(action.data['receiver'], network)} ${this.generateWhiteTextSpan(action.data['stake_cpu_quantity'])} for CPU and ${this.generateWhiteTextSpan(action.data['stake_net_quantity'])} for NET`;
		} else if ('undelegatebw' === act) {
			explanation = `${this.generateUserSpan(action.data['receiver'], network)} undelegated from ${this.generateUserSpan(action.data['from'], network)} ${this.generateWhiteTextSpan(action.data['unstake_cpu_quantity'])} for CPU and ${this.generateWhiteTextSpan(action.data['unstake_net_quantity'])} for NET`;
		} else if ('refund' === act) {
			explanation = `Refund(unstaked) to ${this.generateUserSpan(action.data['owner'], network)}`;
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
				return '<span class="inline-block px-3 py-0.5 rounded bg-solar-500 text-white">Sent Token</span>';
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
			explanation = `${this.generateUserSpan(action.data['from'], network)} &rarr; ${this.generateUserSpan(action.data['to'], network)} ${this.generateWhiteTextSpan(action.data['quantity'])}`;
			if (!TransferActivityDelegate.EOSIO_TOKEN.equals(action.contract)) {
				explanation = `${explanation} (${this.generateUserSpan(String(action.contract), network)})`;
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
			explanation = `New User ${this.generateUserSpan(action.data['name'], network)} created by ${this.generateUserSpan(action.data['creator'], network)}</span>`;
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
			explanation = `${this.generateUserSpan(action.data['payer'], network)} bought ${this.generateWhiteTextSpan(action.data['bytes'] + ' bytes')} RAM for ${this.generateUserSpan(action.data['receiver'], network)}`;
		} else if ('buyram' === act) {
			explanation = `${this.generateUserSpan(action.data['payer'], network)} bought ${this.generateWhiteTextSpan(action.data['quant'])} RAM for ${this.generateUserSpan(action.data['receiver'], network)}`;
		} else if ('sellram' === act) {
			explanation = `${this.generateUserSpan(action.data['account'], network)} sold ${this.generateWhiteTextSpan(action.data['bytes'] + ' bytes')} RAM`;
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
			explanation = `${this.generateUserSpan(action.data['from'], network)} bought ${this.generateWhiteTextSpan(action.data['amount'])} of REX`;
		} else if ('sellrex' === act) {
			explanation = `${this.generateUserSpan(action.data['from'], network)} sold ${this.generateWhiteTextSpan(action.data['rex'])}`;
		} else if ('withdraw' === act) {
			explanation = `${this.generateUserSpan(action.data['owner'], network)} withdrew ${this.generateWhiteTextSpan(action.data['amount'])} from REX fund back to liquid`;
		} else if ('mvfrsavings' === act) {
			explanation = `Move ${this.generateWhiteTextSpan(action.data['rex'])} out of savings bucket`;
		} else if ('mvtosavings' === act) {
			explanation = `Move ${this.generateWhiteTextSpan(action.data['rex'])} to savings bucket`;
		} else if ('unstaketorex' === act) {
			explanation = `${this.generateUserSpan(action.data['owner'], network)} unstake to ${this.generateUserSpan(action.data['receiver'], network)} ${this.generateWhiteTextSpan(action.data['from_cpu'])} for CPU and ${this.generateWhiteTextSpan(action.data['from_net'])} for NET`;
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
			explanation = `${this.generateUserSpan(action.data['voter'], network)} voted through ${this.generateWhiteTextSpan('proxy')} ${this.generateUserSpan(action.data['proxy'], network)}`;
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
