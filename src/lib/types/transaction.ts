import {
	Action,
	BlockTimestamp,
	Bytes,
	Checksum256,
	Int32,
	Int64,
	Name,
	PackedTransaction,
	PermissionLevel,
	Signature,
	SignedTransaction,
	Struct,
	Transaction,
	TransactionHeader,
	UInt32,
	UInt64,
	type AnyAction
} from '@wharfkit/antelope';

@Struct.type('transaction_response_action_decoded')
export class ActionDecoded extends Action {
	@Struct.field('string') declare hex_data: string;
}

@Struct.type('transaction_response_ram_delta')
export class TransactionResponseRamDelta extends Struct {
	@Struct.field(Int32) declare delta: Int32;
	@Struct.field(Name) declare account: Name;
}

@Struct.type('transaction_response_action')
export class TransactionResponseAction extends Struct {
	@Struct.field('name') account!: Name;
	@Struct.field('name') name!: Name;
	@Struct.field(PermissionLevel, { array: true }) authorization!: PermissionLevel[];
	@Struct.field('any') data!: Record<string, any>;
	@Struct.field('string') hex_data!: string;
}

@Struct.type('transaction_response_trace_receipt')
export class ActionTraceReceipt extends Struct {
	@Struct.field(UInt64) declare abi_sequence: UInt64;
	@Struct.field(Checksum256) declare act_digest: Checksum256;
	@Struct.field('any', { array: true })
	declare auth_sequence: [Name, UInt32][];
	@Struct.field(UInt64) declare code_sequence: UInt64;
	@Struct.field(UInt64) declare global_sequence: UInt64;
	@Struct.field(Name) declare receiver: Name;
	@Struct.field(UInt64) declare recv_sequence: UInt64;
}

@Struct.type('transaction_response_trace')
export class ActionTrace extends Struct {
	@Struct.field(TransactionResponseRamDelta, { array: true })
	declare account_ram_deltas: TransactionResponseRamDelta[];
	@Struct.field('any') declare act: TransactionResponseAction;
	@Struct.field(UInt32) declare action_ordinal: UInt32;
	@Struct.field(UInt32) declare block_num: UInt32;
	@Struct.field(BlockTimestamp) declare block_time: BlockTimestamp;
	@Struct.field(UInt32) declare closest_unnotified_ancestor_action_ordinal: UInt32;
	@Struct.field('bool') declare context_free: boolean;
	@Struct.field(UInt32) declare creator_action_ordinal: UInt32;
	@Struct.field(UInt32) declare elapsed: UInt32;
	@Struct.field(Checksum256) declare producer_block_id: Checksum256;
	@Struct.field(ActionTraceReceipt) declare receipt: ActionTraceReceipt;
	@Struct.field(Name) declare receiver: Name;
	@Struct.field(Checksum256) declare trx_id: Checksum256;

	get action(): Action {
		return Action.from({
			account: this.act.account,
			name: this.act.name,
			authorization: this.act.authorization,
			data: this.act.hex_data
		});
	}
}

@Struct.type('transaction_response_info')
export class TransactionResponseInfo extends Struct {
	@Struct.field(Checksum256) declare trx_id: Checksum256;
	@Struct.field(UInt32) declare block_num: UInt32;
	@Struct.field(BlockTimestamp) declare block_time: BlockTimestamp;
	@Struct.field(Name) declare producer_block_id: Name;
}

@Struct.type('transaction_response_info_receipt')
export class TransactionResponseTrxReceipt extends Struct {
	@Struct.field('string') declare status: string;
	@Struct.field(UInt32) declare cpu_usage_us: UInt32;
	@Struct.field(UInt32) declare net_usage_words: UInt32;
	@Struct.field('any', { array: true })
	declare trx: [number, PackedTransaction];
}

@Struct.type('transaction_response_transaction')
export class TransactionResponseTransaction extends TransactionHeader {
	@Struct.field(Action, { array: true }) declare context_free_actions: Action[];
	@Struct.field('bytes[]') declare context_free_data: Bytes[];
	@Struct.field(ActionDecoded, { array: true }) declare actions: ActionDecoded[];
	@Struct.field('signature[]') declare signatures: Signature[];
}

@Struct.type('transaction_response_trx')
export class TransactionResponseTrx extends Struct {
	@Struct.field(TransactionResponseTrxReceipt) declare receipt: TransactionResponseTrxReceipt;
	@Struct.field(TransactionResponseTransaction) declare trx: TransactionResponseTransaction;
}

@Struct.type('transaction_response')
export class TransactionResponse extends Struct {
	@Struct.field(Checksum256) declare id: Checksum256;
	@Struct.field(UInt32) declare block_num: UInt32;
	@Struct.field(BlockTimestamp) declare block_time: BlockTimestamp;
	@Struct.field(UInt32) declare head_block_num: UInt32;
	@Struct.field(UInt32) declare last_irreversible_block: UInt32;
	@Struct.field('bool') declare irreversible: boolean;
	@Struct.field(ActionTrace, { array: true, optional: true })
	declare traces: ActionTrace[];
	@Struct.field(TransactionResponseTrx) declare trx: TransactionResponseTrx;

	// A deduplicated/filtered list of the traces
	get filtered(): ActionTrace[] {
		const digests: string[] = [];
		const traces: ActionTrace[] = this.traces.filter((trace) => {
			if (digests.includes(String(trace.receipt.act_digest))) {
				return false;
			}
			digests.push(String(trace.receipt.act_digest));
			return true;
		});
		return traces;
	}

	// A deduplicated list of actions in this transaction
	get actions(): Action[] {
		return this.filtered.map((trace) => trace.action);
	}

	// The unique contracts used in this transaction
	get contracts(): Name[] {
		return [...new Set(this.actions.map((action) => String(action.account)))].map((contract) =>
			Name.from(contract)
		);
	}

	// A wharfkit/antelope Transaction object from this response
	get transaction(): Transaction {
		return Transaction.from({
			...this.trx.trx,
			actions: this.trx.trx.actions.map((action) =>
				Action.from({
					...action,
					data: action.hex_data
				})
			)
		});
	}

	// A wharfkit/antelope SignedTransaction object from this response
	get signedTransaction(): SignedTransaction {
		return SignedTransaction.from({
			...this.trx.trx,
			actions: this.trx.trx.actions.map((action) =>
				Action.from({
					...action,
					data: action.hex_data
				})
			)
		});
	}
}

@Struct.type('activity_response_action')
export class ActivityResponseAction extends Struct {
	@Struct.field(UInt64) declare global_action_seq: UInt64;
	@Struct.field(UInt64) declare account_action_seq: UInt64;
	@Struct.field(UInt32) declare block_num: UInt32;
	@Struct.field(BlockTimestamp) declare block_time: BlockTimestamp;
	@Struct.field(ActionTrace) declare action_trace: ActionTrace;

	get action(): Action {
		console.log(this.action_trace);
		return Action.from({
			account: this.action_trace.act.account,
			name: this.action_trace.act.name,
			authorization: this.action_trace.act.authorization,
			data: this.action_trace.act.hex_data
		});
	}
}

@Struct.type('activity_response')
export class ActivityResponse extends Struct {
	@Struct.field(ActivityResponseAction, { array: true }) declare actions: ActivityResponseAction[];
	@Struct.field(Int64) declare first: Int64;
	@Struct.field(Int64) declare last: Int64;
	@Struct.field(UInt32) declare head_block_num: UInt32;
}
