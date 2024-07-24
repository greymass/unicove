<script lang="ts">
	import { createToaster, melt } from '@melt-ui/svelte';
	import { toasts, content, title, description, close, portal } from '$lib/state/toaster.svelte';
	import Toast from './toast.svelte';
</script>

<div
	class="fixed right-0 top-0 m-4 z-50 flex flex-col items-end gap-2 md:bottom-0 md:top-auto"
	use:portal
>
	{#each $toasts as {id, data} (id)}
		<!-- <Toast {toast}  /> -->
<div class="rounded-lg bg-neutral-800 text-white shadow-md" use:melt={$content(id)}>
	<div class="relative flex items-center justify-between gap-4 p-5">
		<div>
			<h3 class="flex items-center gap-2 font-semibold" use:melt={$title(id)}>
				{data.title}
				<span class={`size-1.5 rounded-full ${data.color}`}></span>
			</h3>
			<div use:melt={$description(id)}>
				{data.description}
			</div>
		</div>
		<button
			class="absolute right-4 top-4 grid size-6 place-items-center rounded-full hover:bg-neutral-700/50"
			use:melt={$close(id)}
			aria-label="close notification"
		>
			X
		</button>
	</div>
</div>
	{/each}
</div>
