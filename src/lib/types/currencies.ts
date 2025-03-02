import { TokenDefinition } from '$lib/types/token';

export enum SupportedCurrencies {
	BTC = 'BTC',
	CAD = 'CAD',
	CNY = 'CNY',
	ETH = 'ETH',
	EUR = 'EUR',
	KRW = 'KRW',
	USD = 'USD',
	YEN = 'YEN'
}

export const SupportedCurrenciesList = Object.values(SupportedCurrencies);

export const Currencies: Record<SupportedCurrencies, TokenDefinition> = {
	BTC: TokenDefinition.from({
		symbol: '8,BTC'
	}),
	CAD: TokenDefinition.from({
		symbol: '4,CAD'
	}),
	CNY: TokenDefinition.from({
		symbol: '4,CNY'
	}),
	ETH: TokenDefinition.from({
		symbol: '18,ETH'
	}),
	EUR: TokenDefinition.from({
		symbol: '4,EUR'
	}),
	KRW: TokenDefinition.from({
		symbol: '4,KRW'
	}),
	USD: TokenDefinition.from({
		symbol: '4,USD'
	}),
	YEN: TokenDefinition.from({
		symbol: '4,YEN'
	})
};

export const ramKb = TokenDefinition.from({
	symbol: '3,KB'
});
