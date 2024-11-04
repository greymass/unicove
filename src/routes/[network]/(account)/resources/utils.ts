import { PowerUpState } from '@wharfkit/resources';
import type { REXState } from '@wharfkit/resources';
import { API, Asset } from '@wharfkit/antelope';
import type { SampledUsage } from '$lib/types';
import type { Resource } from '@wharfkit/account';

export type RentType = 'POWERUP' | 'REX' | 'STAKE';

export interface PricePair {
	cpuPrice: Asset;
	netPrice: Asset;
}

type ResourceStateType = PowerUpState | REXState | API.v1.AccountObject;

export const calAvailableSize = (resource?: Resource) => {
	let size = 0;
	const available = Number(resource?.available);
	if (!isNaN(available)) size = available / 1000;
	return size;
};

export const getCpuAndNetPrice = (
	rentType: RentType,
	stateType: ResourceStateType,
	sampleUsage: SampledUsage,
	systemTokenSymbol: Asset.Symbol
): PricePair => {
	switch (rentType) {
		case 'POWERUP': {
			const cpuPrice = (stateType as PowerUpState).cpu.price_per_ms(sampleUsage, 1);
			const netPrice = (stateType as PowerUpState).net.price_per_kb(sampleUsage, 1);
			return {
				cpuPrice: compatPriceWithPrecision(cpuPrice, systemTokenSymbol),
				netPrice: compatPriceWithPrecision(netPrice, systemTokenSymbol)
			};
		}
		case 'REX': {
			const cpuPrice = (stateType as REXState).cpu_price_per_ms(sampleUsage, 30);
			const netPrice = (stateType as REXState).net_price_per_kb(sampleUsage, 30);
			return {
				cpuPrice: compatPriceWithPrecision(cpuPrice, systemTokenSymbol),
				netPrice: compatPriceWithPrecision(netPrice, systemTokenSymbol)
			};
		}
		case 'STAKE': {
			const account = stateType as API.v1.AccountObject;
			const cpuPrice = account.cpu_weight.multiplying(1000).dividing(account.cpu_limit.max);
			const netPrice = account.net_weight.multiplying(1000).dividing(account.net_limit.max);
			return {
				cpuPrice: Asset.fromUnits(cpuPrice, systemTokenSymbol),
				netPrice: Asset.fromUnits(netPrice, systemTokenSymbol)
			};
		}
		default:
			throw new Error(`unsupport rent type: ${rentType}`);
	}
};

function compatPriceWithPrecision(price: number, coreTokenSymbol: Asset.Symbol) {
	let precision = coreTokenSymbol.precision;
	if (price > 0 && price < 1 / Math.pow(10, precision)) {
		precision = Number(price.toExponential().split('-')[1]);
	}
	return Asset.from(price, `${precision},${coreTokenSymbol.name}`);
}

export const getPowerupFrac = (
	powerupstate: PowerUpState,
	sampledUsage: SampledUsage,
	amounts: { cpuAmout: number; netAmount: number }
) => {
	const cpu = powerupstate.cpu.frac_by_ms(sampledUsage, amounts.cpuAmout);
	const net = powerupstate.net.frac_by_kb(sampledUsage, amounts.netAmount);
	return [cpu, net];
};
