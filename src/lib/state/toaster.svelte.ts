import { createToaster } from '@melt-ui/svelte';

export type ToastData = {
	title: string;
	description: string;
	color: string;
};

export const {
	elements,
	helpers,
	states: { toasts },
	actions: { portal }
} = createToaster<ToastData>({ closeDelay: 0 });

export const addToast = helpers.addToast;
export const updateToast = helpers.updateToast;
export const removeToast = helpers.removeToast;
