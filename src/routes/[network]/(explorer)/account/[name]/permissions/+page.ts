import type { Permission } from '@wharfkit/account';
import type { PageLoad } from './$types';
import { Name } from '@wharfkit/antelope';
import * as m from '$lib/paraglide/messages';

export interface TreePermission {
	permission: Permission;
	children?: TreePermission[];
}

function buildTree(data: TreePermission[], parentId = Name.from('')): TreePermission[] {
	const tree: TreePermission[] = [];
	data.forEach((item) => {
		// Check if the item belongs to the current parent
		if (item.permission.parent.equals(parentId)) {
			// Recursively build the children of the current item
			const children = buildTree(data, item.permission.perm_name);
			// If children exist, assign them to the current item
			if (children.length) {
				item.children = children;
			}
			// Add the current item to the tree
			tree.push(item);
		}
	});
	return tree;
}

export const load: PageLoad = async ({ params, parent }) => {
	const { network, account } = await parent();

	let tree: TreePermission[] = [];
	if (account.permissions) {
		const permissionTree = account.permissions.map((p) => ({ permission: p }));
		tree = buildTree(permissionTree);
	}

	return {
		subtitle: m.explorer_account_permissions_subtitle({
			network: network.chain.name
		}),
		tree: tree,
		pageMetaTags: {
			title: m.explorer_account_permissions_meta_title({
				account: params.name,
				network: network.chain.name
			}),
			description: m.explorer_account_permissions_meta_description({
				account: params.name,
				network: network.chain.name
			})
		}
	};
};
