<script lang="ts">
	import { TokenBalance } from '@wharfkit/common';
	interface Props {
		token?: TokenBalance;
		title: string;
		description: string;
	}

	const { token, title, description }: Props = $props();
</script>

<div class="relative h-[103px] rounded-lg bg-[#303338]">
	<div class="absolute left-4 top-3">
		<img src={token?.metadata.logo} class="size-6" alt="token icon" />
	</div>
	<div class="absolute right-3 top-3 text-xl font-bold">{title}</div>
	<div class="absolute bottom-2 right-3">
		<h5 class="h5 text-right">{token?.asset}</h5>
		<p>{description}</p>
	</div>
</div>
