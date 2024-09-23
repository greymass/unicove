import { type SelectOption } from '@melt-ui/svelte';

interface ExtendedSelectOption extends SelectOption {
	image?: string;
}

export type SelectOptionVariant = 'pill' | 'form';
