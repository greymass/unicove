import { Name } from '@wharfkit/antelope';
import type { PageLoad } from './$types';
import { PermissionLevel } from '@wharfkit/antelope';

export const load: PageLoad = async ({ parent }) => {
	const { proposal } = await parent();

	const requested_names: Name[] = proposal.approvals.requested_approvals.map(
		({ level }: { level: PermissionLevel }) => Name.from(level.actor)
	);

	const provided_names: Name[] = proposal.approvals.provided_approvals.map(
		({ level }: { level: PermissionLevel }) => Name.from(level.actor)
	);

	return {
		requested_names,
		provided_names
	};
};
