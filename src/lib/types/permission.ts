import type { API } from '@wharfkit/antelope';

export interface TreePermission {
	permission: API.v1.AccountPermission;
	children?: TreePermission[];
}
