export interface LightAPIBalanceRow {
	currency: string;
	contract: string;
	amount: string;
	decimals: string;
}

export interface LightAPIBalanceResponse {
	account_name: string;
	balances: LightAPIBalanceRow[];
}
