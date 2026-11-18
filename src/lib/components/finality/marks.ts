export const MARKED_CELL = 'bg-[color-mix(in_oklab,var(--color-warning)_16%,var(--color-surface))]';

export function rowCell(marked: boolean): string {
	return marked ? MARKED_CELL : '';
}

export const CHRONIC_CELL = `${MARKED_CELL} text-warning`;
