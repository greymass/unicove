import { TokenDefinition } from '$lib/types/token';

export enum SupportedCurrencies {
	AUD = 'AUD',
	BGN = 'BGN',
	BRL = 'BRL',
	BTC = 'BTC',
	CAD = 'CAD',
	CHF = 'CHF',
	CNY = 'CNY',
	CZK = 'CZK',
	DKK = 'DKK',
	EUR = 'EUR',
	GBP = 'GBP',
	HKD = 'HKD',
	HUF = 'HUF',
	IDR = 'IDR',
	ILS = 'ILS',
	INR = 'INR',
	ISK = 'ISK',
	JPY = 'JPY',
	KRW = 'KRW',
	MXN = 'MXN',
	MYR = 'MYR',
	NOK = 'NOK',
	NZD = 'NZD',
	PHP = 'PHP',
	PLN = 'PLN',
	RON = 'RON',
	SEK = 'SEK',
	SGD = 'SGD',
	THB = 'THB',
	TRY = 'TRY',
	USD = 'USD',
	YEN = 'YEN',
	ZAR = 'ZAR'
}

export const SupportedCurrenciesList = Object.values(SupportedCurrencies);

export const Currencies: Record<SupportedCurrencies, TokenDefinition> = {
	AUD: TokenDefinition.from({
		symbol: '4,AUD'
	}),
	BGN: TokenDefinition.from({
		symbol: '4,BGN'
	}),
	BRL: TokenDefinition.from({
		symbol: '4,BRL'
	}),
	BTC: TokenDefinition.from({
		symbol: '8,BTC'
	}),
	CAD: TokenDefinition.from({
		symbol: '4,CAD'
	}),
	CHF: TokenDefinition.from({
		symbol: '4,CHF'
	}),
	CNY: TokenDefinition.from({
		symbol: '4,CNY'
	}),
	CZK: TokenDefinition.from({
		symbol: '4,CZK'
	}),
	DKK: TokenDefinition.from({
		symbol: '4,DKK'
	}),
	EUR: TokenDefinition.from({
		symbol: '4,EUR'
	}),
	GBP: TokenDefinition.from({
		symbol: '4,GBP'
	}),
	HKD: TokenDefinition.from({
		symbol: '4,HKD'
	}),
	HUF: TokenDefinition.from({
		symbol: '4,HUF'
	}),
	IDR: TokenDefinition.from({
		symbol: '4,IDR'
	}),
	ILS: TokenDefinition.from({
		symbol: '4,ILS'
	}),
	INR: TokenDefinition.from({
		symbol: '4,INR'
	}),
	ISK: TokenDefinition.from({
		symbol: '4,ISK'
	}),
	JPY: TokenDefinition.from({
		symbol: '4,JPY'
	}),
	KRW: TokenDefinition.from({
		symbol: '4,KRW'
	}),
	MXN: TokenDefinition.from({
		symbol: '4,MXN'
	}),
	MYR: TokenDefinition.from({
		symbol: '4,MYR'
	}),
	NOK: TokenDefinition.from({
		symbol: '4,NOK'
	}),
	NZD: TokenDefinition.from({
		symbol: '4,NZD'
	}),
	PHP: TokenDefinition.from({
		symbol: '4,PHP'
	}),
	PLN: TokenDefinition.from({
		symbol: '4,PLN'
	}),
	RON: TokenDefinition.from({
		symbol: '4,RON'
	}),
	SEK: TokenDefinition.from({
		symbol: '4,SEK'
	}),
	SGD: TokenDefinition.from({
		symbol: '4,SGD'
	}),
	THB: TokenDefinition.from({
		symbol: '4,THB'
	}),
	TRY: TokenDefinition.from({
		symbol: '4,TRY'
	}),
	USD: TokenDefinition.from({
		symbol: '4,USD'
	}),
	YEN: TokenDefinition.from({
		symbol: '4,YEN'
	}),
	ZAR: TokenDefinition.from({
		symbol: '4,ZAR'
	})
};

export const ramKb = TokenDefinition.from({
	symbol: '3,KB'
});
