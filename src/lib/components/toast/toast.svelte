<script lang="ts">
	import { type Toast, type ToastsElements } from '@melt-ui/svelte';
	import type { ToastData } from '$lib/state/toaster.svelte';

	let { elements = $bindable(), toast = $bindable() } = $props();

	let { content, title, description, close } = elements;
	let { id, data } = toast;
</script>

<div class="rounded-lg bg-neutral-800 text-white shadow-md" use:melt={$content(id)}>
	<div class="relative flex items-center justify-between gap-4 p-5">
		<div>
			<h3 class="flex items-center gap-2 font-semibold" use:melt={$title(id)}>
				{data.title}
				<span class={`size-1.5 rounded-full ${data.color}`} />
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
