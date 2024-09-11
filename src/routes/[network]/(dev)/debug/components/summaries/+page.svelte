<script>
	import Buyrex from './eosio/buyrex.svelte';
	import Mvfrsavings from './eosio/mvfrsavings.svelte';
	import Deposit from './eosio/deposit.svelte';
	import Withdraw from './eosio/withdraw.svelte';
	import Sellrex from './eosio/sellrex.svelte';

	import Transfer from './eosio.token/transfer.svelte';
</script>

<div class="space-y-4">
	<h2 class="h2">Transaction Summary Components</h2>

	<h3 class="h3">eosio</h3>
	<Buyrex />
	<Mvfrsavings />
	<Deposit />
	<Withdraw />
	<Sellrex />

	<h3 class="h3">eosio.token</h3>
	<Transfer />
</div>
