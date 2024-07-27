<script lang='ts'>
import { Cluster, Box, Sidebar, Switcher } from '$lib/components/layout';
</script>

<Box>
	<Sidebar.Root>
		<Sidebar.Side width='10rem'>
			<a href="/">Home</a>
		</Sidebar.Side>

		<Sidebar.Content class='justify-end'>
		<Switcher tag='nav' class='justify-end'>
			<a href="/account">My Account</a>
			<a href="/account/eosio">Account: eosio</a>
			<a href="/block/100000">Block 100,000</a>
			<a href="/transaction/f45c450512181315e811f3a4f29a2ac64c96fdbb3528de97a8907f80abfe74c8"
			>Transaction</a
			>
			<a href="/msig/evilmikehere/t">msig</a>
		</Switcher>
		</Sidebar.Content>
	</Sidebar.Root>
</Box>
