export const CREATIONINDEX_ROUTES = [
	'get_creation',
	'get_creations',
	'get_daily',
	'get_day_creators',
	'get_creators',
	'get_program_daily',
	'get_quota',
	'get_program_events',
	'get_endowment',
	'health'
] as const;

export type CreationindexRoute = (typeof CREATIONINDEX_ROUTES)[number];

export function isCreationindexRoute(route: string): route is CreationindexRoute {
	return (CREATIONINDEX_ROUTES as readonly string[]).includes(route);
}

export type ContributionKind = 'buy' | 'transfer' | 'gift' | 'program_gift' | 'quota_set';

export interface Contribution {
	kind: ContributionKind;
	action: string;
	global_seq: number;
	payer: string;
	bytes: number | null;
	requested_bytes: number | null;
	quantity: string | null;
	fee: string | null;
	memo: string;
}

export interface Creation {
	account: string;
	creator: string;
	program_creator: string;
	block_num: number;
	block_time: string;
	trx_id: string;
	global_seq: number;
	contributions: Contribution[];
}

export interface CreationsPage {
	creations: Creation[];
	more: boolean;
	next: number;
}

export interface KindFigures {
	contributions: number;
	bytes: number | null;
	without_bytes: number;
	requested_bytes: number | null;
	quantity: string | null;
}

export type KindsFigures = Record<ContributionKind, KindFigures>;

export interface CreationDay {
	day: string;
	creations: number;
	creations_without_ram: number;
	kinds: KindsFigures;
}

export interface Daily {
	creator: string;
	days: CreationDay[];
}

export interface DayCreator {
	creator: string;
	creations: number;
	creations_without_ram: number;
	kinds: KindsFigures;
}

export interface DayCreators {
	day: string;
	creators: DayCreator[];
	more: boolean;
	offset: number;
}

export interface RangeCreators {
	from: string;
	to: string;
	creators: DayCreator[];
	more: boolean;
	offset: number;
}

export interface ProgramCreatorDay {
	program_creator: string;
	gifts: number;
	accounts: number;
	bytes: number;
	bytes_per_account: Record<string, number>;
}

export interface ProgramDay {
	day: string;
	program_creators: ProgramCreatorDay[];
}

export interface ProgramDaily {
	program_account: string;
	days: ProgramDay[];
}

export interface QuotaChange {
	time: string;
	action: string;
	daily_quota_bytes: number;
}

export interface Suspension {
	suspended: string;
	resumed: string | null;
}

export interface QuotaWindow {
	start: string;
	end: string;
	gifts: number;
	used_bytes: number;
	daily_quota_bytes: number;
	open: boolean;
	ended_by: string;
}

export interface Registration {
	added: string;
	removed: string | null;
	quotas: QuotaChange[];
	suspensions: Suspension[];
	windows: QuotaWindow[];
}

export interface QuotaHistory {
	program_creator: string;
	registrations: Registration[];
}

export type ProgramEventType = 'admin' | 'program_gift' | 'return' | 'ram_movement';

export interface ProgramEvent {
	type: ProgramEventType;
	action: string;
	global_seq: number;
	block_num: number;
	block_time: string;
	trx_id: string;
	program_creator: string;
	from: string;
	to: string;
	payer: string;
	bytes: number | null;
	absolute_quota: boolean;
	daily_quota_bytes: number | null;
	quantity: string | null;
	fee: string | null;
	memo: string;
	in_creation: boolean;
}

export interface ProgramEventsPage {
	events: ProgramEvent[];
	more: boolean;
	next: number;
}

export interface Endowment {
	program_account: string;
	ram_quota: number;
	ram_usage: number;
	available_bytes: number;
	read_at: string;
}

export interface Health {
	status: string;
	last_global_seq: number;
	last_block_time: string | null;
	program_last_global_seq: number;
	creations: number;
	program_account: string;
}

export interface PageParams {
	after?: number;
	limit?: number;
}

export class CreationindexError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'CreationindexError';
		this.status = status;
	}
}

type QueryValue = string | number | undefined;

export class CreationindexClient {
	private fetchFn: typeof fetch;

	constructor(
		private baseUrl: string,
		customFetch?: typeof fetch
	) {
		this.fetchFn = customFetch ?? fetch;
	}

	private async fetch<T>(
		route: CreationindexRoute,
		params: Record<string, QueryValue> = {}
	): Promise<T> {
		const query = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== '') query.set(key, String(value));
		}
		const search = query.size ? `?${query}` : '';
		let response: Response;
		try {
			response = await this.fetchFn(`${this.baseUrl}/${route}${search}`);
		} catch {
			throw new CreationindexError('Unable to reach the account creation service', 0);
		}
		if (!response.ok) {
			let message = `HTTP ${response.status}`;
			try {
				const body = await response.json();
				if (body.error || body.message) message = body.error || body.message;
			} catch {
				// non-JSON error body; keep the HTTP status message
			}
			throw new CreationindexError(message, response.status);
		}
		return response.json();
	}

	getCreation(account: string): Promise<Creation> {
		return this.fetch('get_creation', { account });
	}

	getCreations(
		filter: { creator: string } | { program_creator: string },
		page: PageParams = {}
	): Promise<CreationsPage> {
		return this.fetch('get_creations', { ...filter, ...page });
	}

	getDaily(from: string, to: string, creator?: string): Promise<Daily> {
		return this.fetch('get_daily', { from, to, creator });
	}

	getDayCreators(
		day: string,
		page: { offset?: number; limit?: number } = {}
	): Promise<DayCreators> {
		return this.fetch('get_day_creators', { day, ...page });
	}

	getCreators(
		from: string,
		to: string,
		page: { offset?: number; limit?: number } = {}
	): Promise<RangeCreators> {
		return this.fetch('get_creators', { from, to, ...page });
	}

	getProgramDaily(from: string, to: string): Promise<ProgramDaily> {
		return this.fetch('get_program_daily', { from, to });
	}

	getQuota(programCreator: string): Promise<QuotaHistory> {
		return this.fetch('get_quota', { program_creator: programCreator });
	}

	getProgramEvents(
		filter: { type?: ProgramEventType; program_creator?: string } = {},
		page: PageParams = {}
	): Promise<ProgramEventsPage> {
		return this.fetch('get_program_events', { ...filter, ...page });
	}

	getEndowment(): Promise<Endowment> {
		return this.fetch('get_endowment');
	}

	getHealth(): Promise<Health> {
		return this.fetch('health');
	}
}
