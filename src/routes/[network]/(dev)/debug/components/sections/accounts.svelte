<script lang="ts">
	import { Cluster, Stack } from '$lib/components/layout';
	import AccountElement from '$lib/components/elements/account.svelte';
	import { Name } from '@wharfkit/antelope';
</script>

<Stack id="accounts">
	<Cluster>
		<h2 class="h2">Accounts</h2>
	</Cluster>

	<Stack class="items-start">
		<h3 class="h3">Account</h3>
		<Cluster>
			<Stack class="gap-2">
				<p class="caption">string</p>
				<AccountElement name="greymass" />
			</Stack>
			<Stack class="gap-2">
				<p class="caption">name</p>
				<AccountElement name={Name.from('greymass')} />
			</Stack>
			<Stack class="gap-2">
				<p class="caption">children</p>
				<AccountElement name="greymass">greymass</AccountElement>
			</Stack>
			<Stack class="gap-2">
				<p class="caption">icon</p>
				<AccountElement name="greymass" icon />
			</Stack>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="h3">Account Tags</h3>
		<Cluster>
			<Stack class="gap-2">
				<p class="caption">disable tag</p>
				<AccountElement name="core.vaulta" tag={false} />
			</Stack>
			<Stack class="gap-2">
				<p class="caption">system contract</p>
				<AccountElement name="core.vaulta" />
			</Stack>
			<Stack class="gap-2">
				<p class="caption">network account</p>
				<AccountElement name="admin.grants" />
			</Stack>
			<Stack class="gap-2">
				<p class="caption">exchange account</p>
				<AccountElement name="krakenkraken" />
			</Stack>
		</Cluster>
	</Stack>
</Stack>
