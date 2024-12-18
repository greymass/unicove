import { API, Asset, Name, Struct, type AssetType, type NameType } from '@wharfkit/antelope';
import type { PageLoad } from './$types';

interface LightAPIHolder {
	account: NameType;
	balance: AssetType;
}

@Struct.type('lightapi_balance')
class LightAPIBalance extends Struct {
	@Struct.field(Name) declare account: Name;
	@Struct.field(Asset) declare balance: Asset;
}

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
	const { network } = await parent();

	const count = Number(url.searchParams.get('count')) || 100;
	const baseUrl = `/${network}/api/token/${params.contract}/${params.symbol}?count=${count}`;
	const response = await fetch(baseUrl);
	const json = await response.json();

	const stats = API.v1.GetCurrencyStatsItemResponse.from(json.stats);
	const topholders = json.topholders.map((result: LightAPIHolder) => {
		return LightAPIBalance.from({
			account: result.account,
			balance: `${result.balance} ${stats.max_supply.symbol.code}`
		});
	});

	// Prevent loading more than 1000 entries since the API ends at 1000
	const loadMoreUrl =
		count < 1000
			? `/${network}/token/${params.contract}/${params.symbol}?count=${count + 100}`
			: undefined;

	return {
		numholders: json.numholders,
		topholders,
		stats,
		loadMoreUrl,
		title: `${stats.supply.symbol.name} Token`,
		subtitle: `A token on the ${params.contract} smart contract.`,
		pageMetaTags: {
			title: `${stats.supply.symbol.name} Token`,
			description: `The ${stats.supply.symbol.name} token created by the ${params.contract} smart contract on the ${network.chain.name} network. ${stats.supply.symbol.name} has ${json.numholders} accounts currently holding a balance.`
		}
	};
};
