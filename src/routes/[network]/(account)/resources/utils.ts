import { ResourceType } from './types';
import { PowerUpState } from '@wharfkit/resources';
import type { REXState } from '@wharfkit/resources';
import { Asset } from '@wharfkit/antelope';
import { SampledUsage } from '$lib/types';

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

export const getPowerupPrice = (resourceType: ResourceType,
	powerupstate: PowerUpState,
	sampleUsage: SampledUsage,
	systemTokenSymbol: Asset.Symbol) => {
	switch (resourceType) {
		case ResourceType.NET:
			const netPrice = powerupstate.net.price_per_kb(sampleUsage, 1)
			return Asset.from(netPrice, systemTokenSymbol);
		case ResourceType.CPU:
			const cpuPrice = powerupstate.cpu.price_per_ms(sampleUsage, 1)
			return Asset.from(cpuPrice, systemTokenSymbol);
		default:
			throw new Error(`unsupport resource type: ${resourceType}`);
	}
};

export const getRexPrice = (resourceType: ResourceType,
	rexState: REXState,
	sampledUsage: SampledUsage,
	systemTokenSymbol: Asset.Symbol) => {
	switch (resourceType) {
		case ResourceType.NET:
			const netPrice = rexState.price_per(sampledUsage, 30000);
			return Asset.from(netPrice, systemTokenSymbol);
		case ResourceType.CPU:
			const cpuPrice = rexState.price_per(sampledUsage, 30000);
			return Asset.from(cpuPrice, systemTokenSymbol);
		default:
			throw new Error(`unsupport resource type: ${resourceType}`);
	}
};

export const getStakingPrice = (resourceType: ResourceType,
	sampledUsage: SampledUsage,
	systemTokenSymbol: Asset.Symbol) => {
	const { account } = sampledUsage;
	switch (resourceType) {
		case ResourceType.NET:
			const pricePerKb = account.net_weight
				.multiplying(1000)
				.dividing(
					account.net_limit.max
				);
			return Asset.fromUnits(pricePerKb, systemTokenSymbol);
		case ResourceType.CPU:
			const pricePerMs = account.cpu_weight
				.multiplying(1000)
				.dividing(
					account.cpu_limit.max
				);
			return Asset.fromUnits(pricePerMs, systemTokenSymbol);
		default:
			throw new Error(`unsupport resource type: ${resourceType}`);
	}
};

export const getPowerupFrac = (resourceType: ResourceType,
	powerupstate: PowerUpState,
	sampledUsage: SampledUsage,
	amount: number) => {
	switch (resourceType) {
		case ResourceType.NET:
			return powerupstate.net.frac_by_kb(
				sampledUsage,
				amount
			);
		case ResourceType.CPU:
			return powerupstate.cpu.frac_by_ms(
				sampledUsage,
				amount
			);
		default:
			throw new Error(`unsupport resource type: ${resourceType}`);
	}
};