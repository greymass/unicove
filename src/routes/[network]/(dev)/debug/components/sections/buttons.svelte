<script lang="ts">
	import { Cluster, Stack } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import IconButton from '$lib/components/button/icon.svelte';
	import { User } from 'lucide-svelte';
</script>

<Stack id="buttons">
	<Cluster>
		<h2 class="h2">Buttons</h2>
	</Cluster>

	<Stack class="items-start">
		<h3 class="h3">Primary</h3>
		<Cluster>
			<Stack class="gap-2">
				<p class="caption">Default</p>
				<Button variant="primary" onclick={() => {}}>EOS (0)</Button>
			</Stack>
			<Stack class="gap-2">
				<p class="caption">Disabled</p>
				<Button variant="primary" disabled onclick={() => {}}>EOS (0)</Button>
			</Stack>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="h3">Secondary</h3>
		<Cluster>
			<Stack class="gap-2">
				<p class="caption">Default</p>
				<Button variant="secondary" onclick={() => {}}>EOS (1)</Button>
			</Stack>
			<Stack class="gap-2">
				<p class="caption">Disabled</p>
				<Button variant="secondary" disabled onclick={() => {}}>EOS (1)</Button>
			</Stack>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="h3">Pill</h3>
		<Cluster>
			<Stack class="gap-1">
				<p class="caption">Default</p>
				<Button variant="pill" onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
			<Stack class="gap-1">
				<p class="caption">Active</p>
				<Button variant="pill" aria-current={true} onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="h3">Text</h3>
		<Cluster>
			<Stack class="gap-1">
				<p class="caption">Default</p>
				<Button variant="text" onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
			<Stack class="gap-1">
				<p class="caption">Disabled</p>
				<Button variant="text" disabled onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="h3">Side by side</h3>
		<Cluster class="items-center">
			<Button variant="text" onclick={() => {}}>Delete</Button>
			<Button variant="secondary" onclick={() => {}}>Cancel</Button>
			<Button variant="primary" onclick={() => {}}>Confirm</Button>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="h3">Icon Buttons</h3>
		<Cluster>
			<IconButton size="large" icon={User} onclick={() => {}}>Cancel</IconButton>
			<IconButton icon={User} onclick={() => {}}>Cancel</IconButton>
		</Cluster>
	</Stack>
</Stack>
