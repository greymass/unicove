<script lang="ts">
	import { localizePath } from '$lib/utils/url';
	import { Button } from 'unicove-components';

	interface Props {
		label: string;
		description: string;
		href: string;
	}

	const props: Props = $props();
</script>

<Button
	variant="text"
	href={localizePath(props.href)}
	class="block h-auto w-full justify-start truncate p-4 text-left"
>
	<div class="flex w-full flex-col gap-1.5">
		<span class="text-label truncate">{props.label}</span>
		<span class="text-muted text-label-sm">{props.description}</span>
	</div>
</Button>
