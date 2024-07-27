<script lang="ts">
let { children } = $props();
import { Box } from '$lib/components/layout';
</script>

<Box>
	<ul>
		<li>
			<a href="/permissions">Permissions</a>
		</li>
		<li>
			<a href="/ram">RAM</a>
		</li>
		<li>
			<a href="/resources">Resources</a>
		</li>
		<li>
			<a href="/send">Send</a>
		</li>
		<li>
			<a href="/transfer">Transfer</a>
		</li>
		<li>
			<a href="/vote">Vote</a>
		</li>
		<li>
			<a href="/transactions">Transactions</a>
		</li>
	</ul>

	{@render children()}
</Box>
