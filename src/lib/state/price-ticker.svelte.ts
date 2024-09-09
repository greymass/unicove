import { Asset } from "@wharfkit/antelope"
import { ChainDefinition, TokenIdentifier } from "@wharfkit/common";
import { chainMapper } from '$lib/wharf/chains';

const PRICE_UPDATE_INTERVAL = 30_000;

export class TokenPriceTicker {
    public prices: Record<string, Asset> = $state({});
    private symbols = new Map<string, Asset.Symbol>();
    private chainId = '';

    private interval?: NodeJS.Timeout;
    private intervalQuery = false;

    public static INST = new TokenPriceTicker();

    private constructor() {
    }

    setTokens(tokens: TokenIdentifier[], chain: ChainDefinition) {
        const symbols = new Map<string, Asset.Symbol>();
        const systemTokenKey = chain.systemToken ? this.makeTokenKey(chain.systemToken) : '';
        for (const token of tokens) {
            const tokenKey = this.makeTokenKey(token);
            if (tokenKey !== systemTokenKey) {
                symbols.set(tokenKey, token.symbol);
            }
        }
        const chaindId = chainMapper.toShortName(String(chain.id));
        let changed = false;
        if (!this.isMapEqual(symbols, this.symbols) || chaindId !== this.chainId) {
            this.symbols = symbols;
            this.chainId = chaindId;
            changed = true;
        }
        if (changed && this.isVaid()) {
            this.stopIntervalQueryInnter();
            this.loadPrices();
            if (this.intervalQuery)
                this.startIntervalQuery();
        }
    }

    startIntervalQuery() {
        if (this.intervalQuery) {
            return;
        }
        this.intervalQuery = true;
        if (!this.isVaid()) {
            return;
        }
        if (!this.interval) {
            this.startIntervalQueryInnter();
        }
    }

    stopIntervalQuery() {
        this.intervalQuery = false;
        this.stopIntervalQueryInnter();
    }

    getPrice(token: TokenIdentifier) {
        const tokenKey = this.makeTokenKey(token);
        return this.prices[tokenKey];
    }

    private startIntervalQueryInnter() {
        this.interval = setInterval(() => {
            if (this.intervalQuery) {
                this.loadPrices();
            }
        }, PRICE_UPDATE_INTERVAL)
    }

    private stopIntervalQueryInnter() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    private loadPrices() {
        for (let [key, value] of this.symbols) {
            this.priceTicker(value).then(result => {
                const price = Asset.fromUnits(result.median, '4,USD');
                this.prices[key] = price;
            }).catch(error => {
                console.error(error)
            });
        }
    }

    private async priceTicker(symbol: Asset.Symbol) {
        const name = symbol.name.toLowerCase() + 'usd';
        const response = await fetch(
            `/${this.chainId}/api/priceticker/ ${name} `
        );
        const json = await response.json();
        return json.tokenstate;
    }

    private isVaid() {
        return !!this.symbols.size && !!this.chainId
    }

    private makeTokenKey(token: TokenIdentifier): string {
        return [String(token.chain), String(token.contract), String(token.symbol.name)]
            .join('-')
            .replace(/[()]/g, '')
            .replace(/\s/g, '-')
            .toLowerCase()
    }

    private isMapEqual(map1: Map<string, Asset.Symbol>, map2: Map<string, Asset.Symbol>): boolean {
        if (map1.size !== map2.size) {
            return false;
        }
        for (const [key, value] of map1) {
            if (!map2.has(key) || !value.equals(map2.get(key)!)) {
                return false;
            }
        }
        return true;
    }
}

