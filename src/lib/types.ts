import { Asset, Name, Struct } from '@wharfkit/antelope';

export interface HistoricalPrice {
	date: Date;
	value: Asset;
}

export interface HistoricalPrices {
	[timeframe: string]: HistoricalPrice;
}

export type DescriptionItem = {
	key: string;
	value: string;
};

export type ActionDisplayVariants = 'summary' | 'ricardian' | 'pretty' | 'decoded' | 'json';

@Struct.type('account_linked_action')
export class AccountLinkedAction extends Struct {
	@Struct.field('name') declare account: Name;
	@Struct.field('name', { optional: true }) declare action?: Name;
}
