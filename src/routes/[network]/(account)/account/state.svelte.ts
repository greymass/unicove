import { Asset } from "@wharfkit/antelope";
import { TokenMeta } from "@wharfkit/common";
import { calculateValue } from '$lib/state/client/account.svelte';

export class TokenState {
    public readonly asset: Asset;
    public readonly tokenMeta?: TokenMeta
    public readonly price?: Asset;
    public readonly value?: Asset;
    public sendUrl: string = $derived(this.tokenMeta
        ? `${String(this.tokenMeta.id.contract)}/${this.tokenMeta.id.symbol.name.toLowerCase()}`
        : '')

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
    public total?: TokenState = $state();
    public systemToken?: TokenState = $state();
    public delegated?: TokenState = $state();
    public staked?: TokenState = $state();
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
        this.others = [];
    }
}