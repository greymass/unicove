import type { Asset } from '@wharfkit/antelope';

export interface DefaultContracts {
	delphioracle?: DelphiOracleContract;
	token: TokenContract;
	system: SystemContract;
}

export type FeatureType = 'delphioracle' | 'lightapi' | 'rex' | 'robo';

export interface ChainConfig {
	features: Record<FeatureType, boolean>;
	symbol: Asset.SymbolType;
}

export const chainConfigs: Record<string, ChainConfig> = {
	// EOS
	aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906: {
		features: {
			delphioracle: true,
			lightapi: true,
			rex: true,
			robo: true
		},
		symbol: '4,EOS'
	},
	// Jungle4
	'73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d': {
		features: {
			delphioracle: false,
			lightapi: false,
			rex: true,
			robo: true
		},
		symbol: '4,EOS'
	},
	// Telos
	'4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11': {
		features: {
			delphioracle: true,
			lightapi: true,
			rex: true,
			robo: false
		},
		symbol: '4,TLOS'
	}
};

export const chainMap: Record<string, string> = {
	aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906: 'eos',
	'21dcae42c0182200e93f954a074011f9048a7624c6fe81d3c9541a614a88bd1c': 'fio',
	b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e: 'fiotestnet',
	'73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d': 'jungle4',
	'5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191': 'kylintestnet',
	'38b1d7815474d0c60683ecbea321d723e83f5da6ae5f1c1f9fecc69d9ba96465': 'libre',
	b64646740308df2ee06c6b72f34c0f7fa066d940e831f752db2006fcc2b78dee: 'libretestnet',
	'384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0': 'proton',
	'71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd': 'protontestnet',
	'4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11': 'telos',
	'1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f': 'telostestnet',
	'8fc6dce7942189f842170de953932b1f66693ad3788f766e777b6f9d22335c02': 'ux',
	'1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4': 'wax',
	f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12: 'waxtestnet'
};

export function createMappers<M extends Record<keyof M, PropertyKey>>(map: M) {
	const invertedMap = (Object.entries(map) as Array<[PropertyKey, PropertyKey]>).reduce(
		(inverted, [key, value]) => ({ ...inverted, [value]: key }),
		{}
	) as Invert<M>;
	const toShortName = <K extends keyof M>(from: K) => map[from];
	const toChainId = <K extends keyof Invert<M>>(to: K) => invertedMap[to];

	return { toShortName, toChainId };
}

export const chainMapper = createMappers(chainMap);
