<script lang="ts">
	import { Info } from 'lucide-svelte';
	import { Stack } from '$lib/components/layout';
	import Tooltip from '$lib/components/tooltip/tooltip.svelte';
</script>

<Stack id="tooltips" class="space-y-8">
	<div>
		<h2 class="h2 mb-4">Tooltips</h2>
		<p>Tooltips provide additional information when hovering over an element.</p>
	</div>

	<div class="flex items-center space-x-4">
		<Tooltip content="Another tooltip example">
			<span class="cursor-help underline">Small tooltip</span>
		</Tooltip>
	</div>

	<div class="flex items-center space-x-4">
		<Tooltip
			content="This is a medium-length tooltip that provides more detailed information about a feature or concept."
		>
			<span class="cursor-help underline">Medium tooltip</span>
		</Tooltip>
	</div>

	<div class="flex items-center space-x-4">
		<Tooltip
			content="This is a longer tooltip that can be used to provide comprehensive explanations or instructions. It's useful when you need to convey more complex information without cluttering the main interface. Remember that tooltips should still be concise and to the point."
		>
			<span class="cursor-help underline">Large tooltip</span>
		</Tooltip>
	</div>

	<div class="flex items-center space-x-4">
		<Tooltip
			content="This is a long tooltip with an icon. Icons can be used to provide visual cues about the type of information being presented. For example, this icon might indicate that the tooltip contains important or critical information that the user should pay attention to."
			icon={Info}
		>
			<span class="cursor-help underline">Tooltip with icon</span>
		</Tooltip>
	</div>

	<div class="flex items-center space-x-4">
		<Tooltip
			content="This tooltip has a longer fade in duration, making it show up more slowly."
			duration={1000}
		>
			<span class="cursor-help underline">Slowly appearing tooltip</span>
		</Tooltip>
	</div>
</Stack>
