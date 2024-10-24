import { ResourceType } from './types';
import { PowerUpState } from '@wharfkit/resources';
import type { REXState } from '@wharfkit/resources';
import { API, Asset } from '@wharfkit/antelope';
import type { SampledUsage } from '$lib/types';

export enum RentType {
	POWERUP,
	REX,
	STAKE
}

export interface PricePair {
	cpuPrice: Asset;
	netPrice: Asset;
}

type ResourceStateType = PowerUpState | REXState | API.v1.AccountObject;

export const calSize = (available: number) => {
	let size = 0;
	if (!isNaN(available)) size = available / 1000;
	return Number(size.toFixed(2));
};

export const calUsagePer = (used: number, max: number) => {
	let percentage = 100;
	if (isNaN(max) || isNaN(used)) {
		percentage = 0;
	} else if (max === 0) {
		percentage = 100;
	} else {
		percentage = (used / max) * 100;
		if (percentage > 100) {
			percentage = 100;
		}
	}
	return Number(percentage.toFixed(1));
};

export const getName = (resourceType: ResourceType) => {
	switch (resourceType) {
		case ResourceType.RAM:
			return 'RAM';
		case ResourceType.CPU:
			return 'CPU';
		case ResourceType.NET:
			return 'NET';
	}
};

export const getUnit = (resourceType: ResourceType) => {
	switch (resourceType) {
		case ResourceType.RAM:
		case ResourceType.NET:
			return 'kb';
		case ResourceType.CPU:
			return 'ms';
	}
};

export const getCpuAndNetPrice = (
	rentType: RentType,
	stateType: ResourceStateType,
	sampleUsage: SampledUsage,
	systemTokenSymbol: Asset.Symbol
): PricePair => {
	switch (rentType) {
		case RentType.POWERUP: {
			const cpuPrice = (stateType as PowerUpState).cpu.price_per_ms(sampleUsage, 1);
			const netPrice = (stateType as PowerUpState).net.price_per_kb(sampleUsage, 1);
			return {
				cpuPrice: compatPriceWithPrecision(cpuPrice, systemTokenSymbol),
				netPrice: compatPriceWithPrecision(netPrice, systemTokenSymbol)
			};
		}
		case RentType.REX: {
			const cpuPrice = (stateType as REXState).cpu_price_per_ms(sampleUsage, 30);
			const netPrice = (stateType as REXState).net_price_per_kb(sampleUsage, 30);
			return {
				cpuPrice: compatPriceWithPrecision(cpuPrice, systemTokenSymbol),
				netPrice: compatPriceWithPrecision(netPrice, systemTokenSymbol)
			};
		}
		case RentType.STAKE: {
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
