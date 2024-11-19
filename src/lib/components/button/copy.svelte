<script lang="ts">
	import { getSetting } from '$lib/state/settings.svelte';
	import Copy from 'lucide-svelte/icons/copy';

	interface Props {
		data: string;
	}

	let { value: debugMode } = getSetting('debug-mode', false);

	let props: Props = $props();

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(props.data);
			if (debugMode) console.log(props.data, 'copied to clipboard');
		} catch (err) {
			if (debugMode) console.error('Failed to copy text: ', err);
		}
	}
</script>

<!-- Styled specifically for the PageHeader component  -->
<!-- Uses absolute positioning so it can maintain a decent hit slop on mobile without affecting layout -->
<button
	onclick={copyToClipboard}
	class="absolute right-0 grid size-12 translate-x-10 translate-y-1 place-items-center text-skyBlue-500 hover:text-skyBlue-400 focus-visible:text-solar-500 focus-visible:outline-none"
>
	<Copy class="size-4 " />
</button>
