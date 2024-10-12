<script>
	import Button from '$lib/components/button/button.svelte';

	import { Card, Stack, Switcher } from '$lib/components/layout';
</script>

<Stack id="cards">
	<h2 class="h2">Cards</h2>

	<div class="flex justify-center">
		<Switcher threshold="40rem" class="items-start">
			<Card class="gap-5">
				<Stack class="gap-0">
					<p class="caption">Currently Staked - 34% APY</p>
					<p class="h3">0.0 EOS</p>
					<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2">USD Value $0.0</p>
				</Stack>
				<Switcher threshold="20rem">
					<Button variant="secondary" class="text-skyBlue-500">Stake</Button>
					<Button variant="secondary" class="text-skyBlue-500">Unstake</Button>
				</Switcher>
			</Card>

			<Card title="Unstaking Balances Is A Long Title">
				<table class="table-styles">
					<thead class="border-b-2 border-shark-100/10">
						<tr class="caption font-medium">
							<th class="p-4 text-left">Amount</th>
							<th class="p-4 text-right">Date available</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="p-4">0 EOS</td>
							<td class="p-4 text-right">Not connected</td>
						</tr>
					</tbody>
				</table>
				<Button variant="secondary" class="text-skyBlue-500">Withdraw</Button>
			</Card>
		</Switcher>
	</div>
</Stack>
