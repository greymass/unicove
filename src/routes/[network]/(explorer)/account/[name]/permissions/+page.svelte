<script lang="ts">
	import { API, Name } from '@wharfkit/antelope';
	import PermissionTree from './permissiontree.svelte';

	const { data } = $props();

	interface TreePermission {
		permission: API.v1.AccountPermission;
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

	const treePermissions = $derived(data.account.permissions.map((p) => ({ permission: p })));
	const permissions = $derived(buildTree(treePermissions));
</script>

<PermissionTree {permissions} />
