<script lang="ts">
	import { createToaster, melt } from '@melt-ui/svelte';
	import { toasts, elements, portal } from '$lib/state/toaster.svelte';
	import Toast from './toast.svelte';
</script>

<div
	class="fixed right-0 top-0 m-4 z-50 flex flex-col items-end gap-2 md:bottom-0 md:top-auto"
	use:portal
>
	{#each $toasts as toast (toast.id)}
		<Toast {toast} {elements} />
	{/each}
</div>
