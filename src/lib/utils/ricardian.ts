import { type ABI } from '@wharfkit/antelope';
import yaml from 'yaml';

export const ricardianRegExp = new RegExp(/---\n(.*?)\n---(.*)+/s);

export interface RicardianMeta {
	spec_version: string;
	title: string;
	icon: string;
	summary: string;
}

export interface RicardianData {
	meta?: RicardianMeta;
	text?: string;
}

export function parseRicardian(action: ABI.Action | undefined): RicardianData | undefined {
	if (!action) {
		return undefined;
	}

	try {
		const ricardianData = ricardianRegExp.exec(action.ricardian_contract);
		const meta: RicardianMeta =
			ricardianData && ricardianData.length ? yaml.parse(ricardianData[1]) : undefined;
		const text = ricardianData && ricardianData.length ? ricardianData[2] : undefined;
		return {
			meta,
			text
		};
	} catch {
		return {};
	}
}
