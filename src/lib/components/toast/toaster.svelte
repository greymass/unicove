<script lang="ts">
	import { toasts, elements, portal } from '$lib/state/toaster.svelte';
	import Toast from './toast.svelte';
	import { flip } from 'svelte/animate';
</script>

<div
	class="fixed right-0 top-0 z-50 m-4 flex flex-col items-end gap-2 md:bottom-0 md:top-auto"
	use:portal
>
	{#each $toasts as toast (toast.id)}
		<div animate:flip={{ duration: 500 }}>
			<Toast {toast} {elements} />
		</div>
	{/each}
</div>
