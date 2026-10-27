import { Serializer, type ABI, type APIClient } from '@wharfkit/antelope';
import { bindingMsigAuthority, type MsigAuthority } from '$lib/wharf/msig/authority';
import {
	chainPermissions,
	type GetPermissions,
	type PermissionDef
} from '$lib/wharf/msig/proposer';
import {
	CreationindexError,
	type CreationindexClient,
	type Endowment,
	type ProgramDay,
	type ProgramEvent,
	type ProgramProposal
} from './client';
import {
	DAY_MS,
	OBSERVED_DAYS,
	YEAR_DAYS,
	committedRunway,
	isoDay,
	listCreators,
	observedRunway,
	parseCreatorRow,
	type CreatorRow,
	type OpenProposal,
	type ProposalAction
} from './onboarding';

export const MESSAGER = 'msigmessager';
const PAGE_LIMIT = 1000;
const MAX_PAGES = 20;

interface MsigDetail {
	transaction?: {
		actions?: { account: string; name: string; data: unknown }[];
	};
	provided_approvals?: { actor: string; permission: string }[];
	authorities?: MsigAuthority[];
}

export class GiftProgram {
	readonly contract: string;
	readonly client: CreationindexClient;
	readonly chain: APIClient;
	readonly getPermissions: GetPermissions;

	loading = $state(true);
	failed = $state(false);
	permissions = $state<PermissionDef[] | null>(null);
	enabled = $state(false);
	endowment = $state<Endowment | null>(null);
	creators = $state<CreatorRow[]>([]);
	daily = $state<ProgramDay[]>([]);
	adminEvents = $state<ProgramEvent[]>([]);
	returns = $state<ProgramEvent[]>([]);
	now = $state(Date.now());

	proposals = $state<OpenProposal[] | null>(null);
	proposalsFailed = $state(false);

	constructor(contract: string, client: CreationindexClient, chain: APIClient) {
		this.contract = contract;
		this.client = client;
		this.chain = chain;
		this.getPermissions = chainPermissions(chain);
	}

	get exists() {
		return this.permissions !== null;
	}

	get available() {
		return this.endowment?.available_bytes ?? 0;
	}

	get observed() {
		return observedRunway(this.daily, this.returns, this.available, this.now);
	}

	get committed() {
		return committedRunway(this.creators, this.enabled, this.available);
	}

	get listing() {
		return listCreators(this.creators, this.adminEvents);
	}

	get suspendedCount() {
		return this.creators.filter((c) => c.suspended).length;
	}

	row(creator: string): CreatorRow | null {
		return this.creators.find((c) => c.creator === creator) ?? null;
	}

	async load() {
		this.loading = true;
		this.failed = false;
		this.now = Date.now();
		try {
			const permissions = await this.getPermissions(this.contract);
			this.permissions = permissions;
			if (permissions) {
				const [endowment, daily, adminEvents, returns] = await Promise.all([
					this.client.getEndowment().catch((e) => {
						if (e instanceof CreationindexError && e.status === 404) return null;
						throw e;
					}),
					this.client.getProgramDaily(
						isoDay(this.now - (YEAR_DAYS - 1) * DAY_MS),
						isoDay(this.now)
					),
					this.allAdminEvents(),
					this.recentReturns(),
					this.loadTables()
				]);
				this.endowment = endowment;
				this.daily = daily.days;
				this.adminEvents = adminEvents;
				this.returns = returns;
			}
		} catch {
			this.failed = true;
		} finally {
			this.loading = false;
		}
	}

	private async allAdminEvents(): Promise<ProgramEvent[]> {
		const all: ProgramEvent[] = [];
		let after: number | undefined;
		for (let i = 0; i < MAX_PAGES; i++) {
			const page = await this.client.getProgramEvents(
				{ type: 'admin' },
				{ after, limit: PAGE_LIMIT }
			);
			all.push(...page.events);
			if (!page.more) break;
			after = page.next;
		}
		return all;
	}

	private async recentReturns(): Promise<ProgramEvent[]> {
		const from = isoDay(this.now - (OBSERVED_DAYS - 1) * DAY_MS);
		const all: ProgramEvent[] = [];
		let before: number | undefined;
		for (let i = 0; i < MAX_PAGES; i++) {
			const page = await this.client.getProgramEvents(
				{ type: 'return' },
				{ order: 'desc', before, limit: PAGE_LIMIT }
			);
			all.push(...page.events);
			if (!page.more || page.events.some((e) => e.block_time.slice(0, 10) < from)) break;
			before = page.next;
		}
		return all;
	}

	private async loadTables() {
		const [config, creators] = await Promise.all([
			this.chain.v1.chain.get_table_rows({
				code: this.contract,
				scope: this.contract,
				table: 'config',
				json: true
			}),
			this.chain.v1.chain.get_table_rows({
				code: this.contract,
				scope: this.contract,
				table: 'creators',
				json: true,
				limit: PAGE_LIMIT
			})
		]);
		this.enabled = config.rows.length > 0 && Boolean(config.rows[0].enabled);
		this.creators = creators.rows.map((r: Record<string, unknown>) => parseCreatorRow(r));
	}

	async accountExists(name: string): Promise<boolean> {
		return this.chain.v1.chain
			.get_account(name)
			.then(() => true)
			.catch(() => false);
	}

	private messager: Promise<boolean> | undefined;

	messagerExists(): Promise<boolean> {
		this.messager ??= this.accountExists(MESSAGER);
		return this.messager;
	}

	async loadProposals(msigPath: (proposer: string, name: string) => string, abi: ABI) {
		this.proposalsFailed = false;
		try {
			const open: ProgramProposal[] = [];
			let after: number | undefined;
			for (let i = 0; i < MAX_PAGES; i++) {
				const page = await this.client.getProgramProposals('open', { after, limit: PAGE_LIMIT });
				open.push(...page.proposals);
				if (!page.more) break;
				after = page.next;
			}
			const details = await Promise.all(
				open.map((p) =>
					fetch(msigPath(p.proposer, p.proposal_name))
						.then((r) => (r.ok ? (r.json() as Promise<MsigDetail>) : null))
						.catch(() => null)
				)
			);
			this.proposals = open
				.map((p, i) => this.openProposal(p, details[i], abi))
				.toSorted((a, b) => a.expiration.localeCompare(b.expiration));
		} catch {
			this.proposalsFailed = true;
		}
	}

	private openProposal(p: ProgramProposal, detail: MsigDetail | null, abi: ABI): OpenProposal {
		const fromTrx = (detail?.transaction?.actions ?? [])
			.filter((a) => String(a.account) === this.contract)
			.map((a) => ({ name: String(a.name), creator: actionCreator(a.name, a.data, abi) }));
		const actions: ProposalAction[] = fromTrx.length
			? fromTrx
			: p.actions
					.filter((a) => a.account === this.contract)
					.map((a) => ({ name: a.name, creator: '' }));
		const binding = bindingMsigAuthority(detail?.authorities);
		const provided = (detail?.provided_approvals ?? []).map(
			(a) => `${String(a.actor)}@${String(a.permission)}`
		);
		const own = binding ? `${binding.actor}@${binding.permission}` : '';
		const counted = new Set([
			own,
			...(binding?.entries ?? [])
				.filter((e) => e.kind === 'account')
				.map((e) => `${e.actor}@${e.permission}`)
		]);
		// A key-held permission approved as itself has no account entry to mark.
		const selfApproved = binding !== null && provided.includes(own);
		return {
			proposer: p.proposer,
			name: p.proposal_name,
			expiration: p.expiration,
			actions,
			satisfied: binding ? (selfApproved ? binding.threshold : binding.satisfied) : null,
			threshold: binding?.threshold ?? null,
			standby: binding ? provided.filter((key) => !counted.has(key)).length : 0
		};
	}
}

// Proposal action data arrives decoded from the msig index and as hex from the chain fallback.
function actionCreator(name: string, data: unknown, abi: ABI): string {
	if (data && typeof data === 'object' && 'creator' in data) {
		return String((data as { creator: unknown }).creator);
	}
	if (typeof data !== 'string' || !data) return '';
	try {
		const decoded = Serializer.objectify(Serializer.decode({ data, abi, type: name })) as {
			creator?: unknown;
		};
		return decoded.creator ? String(decoded.creator) : '';
	} catch {
		return '';
	}
}
