import { Asset } from "@wharfkit/antelope";
import { TokenMeta } from "@wharfkit/common";
import { calculateValue } from '$lib/state/client/account.svelte';

export class REXState {
    public savings: Asset | undefined = $state();
    public matured: Asset | undefined = $state();
    public fund: Asset | undefined = $state();
    public withDrawable = $derived.by(() => {
        if (this.matured && this.fund)
            return Asset.fromUnits(
                this.matured.units.adding(this.fund.units),
                this.fund.symbol
            )
        return this.matured || this.fund
    })

    public apy: string = $state('');

    reset() {
        this.savings = undefined;
        this.matured = undefined;
        this.fund = undefined;
        this.apy = '';
    }
}

export class TokenState {
    readonly asset: Asset;
    readonly tokenMeta?: TokenMeta
    readonly price?: Asset;
    readonly value?: Asset;

    constructor(asset: Asset, tokenMeta?: TokenMeta, price?: Asset, value?: Asset) {
        this.asset = asset;
        this.tokenMeta = tokenMeta;
        this.price = price;
        this.value = value;
    }

    static from(balance: Asset, tokenMeta?: TokenMeta, price?: Asset): TokenState {
        let value: Asset | undefined = undefined;
        if (price) {
            value = calculateValue(balance, price);
        }
        return new TokenState(balance, tokenMeta, price, value);
    }
}

export class TokenList {
    public key: string = '';
    public total: TokenState | undefined = $state();
    public systemToken: TokenState | undefined = $state();
    public delegated: TokenState | undefined = $state();
    public staked: TokenState | undefined = $state();
    public rexState: REXState = $state(new REXState());

    public others: TokenState[] = $state([]);

    setKey(key: string) {
        this.key = key;
    }

    reset() {
        this.key = '';
        this.total = undefined;
        this.systemToken = undefined;
        this.delegated = undefined;
        this.staked = undefined;
        this.rexState.reset();
        this.others = [];
    }
}