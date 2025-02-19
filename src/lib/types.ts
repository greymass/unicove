import { Asset } from '@wharfkit/antelope';

export interface HistoricalPrice {
	date: Date;
	value: Asset;
}

export type DescriptionItem = {
	key: string;
	value: string;
};

export type ActionDisplayVariants = 'summary' | 'ricardian' | 'pretty' | 'decoded' | 'json';
