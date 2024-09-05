import { Asset } from "@wharfkit/antelope"
import { ChainDefinition, TokenIdentifier } from "@wharfkit/common";
import { chainMapper } from '$lib/wharf/chains';

const PRICE_UPDATE_INTERVAL = 30_000;

export class TokenPriceTicker {
    public prices: Record<string, Asset> = $state({});
    private symbols = new Map<string, Asset.Symbol>();
    private chainId = '';

    private interval?: NodeJS.Timeout;

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
        this.symbols = symbols;
        this.chainId = chainMapper.toShortName(String(chain.id));
    }

    startLoad() {
        if (!this.symbols.size || !this.chainId) {
            this.stopInner();
            return;
        }
        if (this.interval) {
            return;
        }

        this.startInner();
    }

    stopLoad() {
        if (!this.interval)
            return;
        this.stopInner();
    }

    getPrice(token: TokenIdentifier) {
        const tokenKey = this.makeTokenKey(token);
        return this.prices[tokenKey];
    }

    private startInner() {
        this.loadPrices();
        this.interval = setInterval(() => {
            this.loadPrices();
        }, PRICE_UPDATE_INTERVAL)
    }

    private stopInner() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    private loadPrices() {
        for (let [key, value] of this.symbols) {
            this.priceTicker(value).then(result => {
                const price = Asset.fromUnits(result.median, '4,USD');
                console.log("price = ", price)
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


    private makeTokenKey(token: TokenIdentifier): string {
        return [String(token.chain), String(token.contract), String(token.symbol.name)]
            .join('-')
            .replace(/[()]/g, '')
            .replace(/\s/g, '-')
            .toLowerCase()
    }

}

