<script lang="ts">
	import { fly } from 'svelte/transition';
	import { melt, type Toast } from '@melt-ui/svelte';

	import type { elements as toastElements, ToastData } from '$lib/state/toaster.svelte';

	interface Props {
		elements: typeof toastElements;
		toast: Toast<ToastData>;
	}

	let { elements, toast }: Props = $props();
	let { description, content, title, close } = $derived(elements);
	let { id, data } = $derived(toast);
</script>

<!-- TODO: Color audit -->
<div
	class="rounded-lg bg-mineShaft-800 text-white shadow-md"
	in:fly={{ duration: 150, x: '100%' }}
	out:fly={{ duration: 150, x: '100%' }}
	use:melt={$content(id)}
>
	<a class="text-inherit no-underline" href="/transactions">
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
				class="absolute right-4 top-4 grid size-6 place-items-center rounded-full hover:bg-mineShaft-700/50"
				use:melt={$close(id)}
				aria-label="close notification"
			>
				X
			</button>
		</div>
	</a>
</div>
