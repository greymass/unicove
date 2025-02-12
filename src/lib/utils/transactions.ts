import type { ActivityAction, ActivityActionWrapper } from '$lib/types';
import { Checksum256 } from '@wharfkit/antelope';

export function convertActivityAction(
	currentAcount: string,
	action: ActivityAction
): ActivityActionWrapper | undefined {
	const [actionName, actionStyle] = getActionNameAndStyle(currentAcount, action);
	if (!actionName) return undefined;
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
		actionName,
		actionStyle,
		actionData: action.data
	};
}

const transferActions = ['transfer'];

const ramActions: Record<string, string> = {
	buyrambytes: 'Buy RAM',
	buyram: 'Buy RAM',
	sellram: 'Sell Ram'
};
const accountActions: Record<string, string> = {
	newaccount: 'New Account',
	linkauth: 'Link Auth',
	unlinkauth: 'Unlink Auth',
	updateauth: 'Update Auth',
	deleteauth: 'Delete Auth'
};

const voteActions: Record<string, string> = {
	voteproducer: 'Vote'
};

const otherActions: Record<string, string> = {
	buyrex: 'Buy REX',
	sellrex: 'Sell REX',
	withdraw: 'REX Fund Withdraw',
	mvfrsavings: 'REX Savings Out',
	mvtosavings: 'REX Savings In',
	deposit: 'Deposit',
	rentnet: 'Rent NET',
	rentcpu: 'Rent CPU',
	unstaketorex: 'Staked to REX',
	delegatebw: 'Delegate',
	undelegatebw: 'Undelegate',
	refund: 'Refund',
	claimrewards: 'Claim Rewards',
	regproducer: 'Reg Producer',
	unregprod: 'Unreg Producer'
};

function getActionNameAndStyle(currentAccount: string, action: ActivityAction) {
	const act = String(action.action);
	let actionName;
	if (transferActions.includes(act)) {
		if (!isMyActionTrace(currentAccount, action)) {
			return ['', ''];
		}
	} else if ((actionName = ramActions[act])) {
		if (!isMyActionTrace(currentAccount, action)) {
			return ['', ''];
		}
		return [actionName, 'bg-mineShaft-500'];
	} else if ((actionName = accountActions[act])) {
		return [actionName, 'bg-red-500'];
	} else if ((actionName = voteActions[act])) {
		return [actionName, 'bg-red-500'];
	} else if ((actionName = otherActions[act])) {
		return [actionName, 'bg-mineShaft-500'];
	}
	return [`${action.contract} - ${action.action}`, 'bg-mineShaft-500'];
}

function isMyActionTrace(currentAccount: string, action: ActivityAction) {
	return action['raw']['action_trace']['receiver'] === currentAccount;
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
