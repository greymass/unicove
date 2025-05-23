<script lang="ts">
	import { FileUpload, type FileUploadProps } from 'melt/builders';
	import { SvelteSet } from 'svelte/reactivity';
	import IconButton from '../button/icon.svelte';
	import { X } from 'lucide-svelte';

	let props: FileUploadProps<boolean> = $props();

	const fileUpload = new FileUpload({
		...props,
		onError: (e) => console.error(e)
	});

	const files = $derived.by(() => {
		if (fileUpload.selected instanceof SvelteSet) {
			return Array.from(fileUpload.selected);
		}
		return [fileUpload.selected].filter((f): f is File => !!f);
	});
</script>

<!-- This input is hidden -->
<input {...fileUpload.input} />
<div
	class="bg-surface-container data-dragging:bg-surface-container-high border-outline grid h-48 place-items-center rounded-lg border border-2 p-6 text-center text-balance"
	{...fileUpload.dropzone}
>
	{#if fileUpload.isDragging}
		<span> Drop files here </span>
	{:else}
		<span>
			Click to upload <span class="text-muted">or drag and drop</span>
		</span>
	{/if}
</div>

{#if files.length > 0}
	<ul>
		{#each files as file}
			<li class="flex items-center justify-between">
				{file.name}
				<IconButton icon={X} onclick={() => fileUpload.remove(file)}></IconButton>
			</li>
		{/each}
	</ul>
{/if}
