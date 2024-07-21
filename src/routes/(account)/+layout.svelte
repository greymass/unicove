<script lang="ts">
	import extend from 'just-extend';
	import { type SeoConfig } from 'svead';

	import { page } from '$app/stores';

	let { children, data } = $props();
</script>

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
</ul>

{@render children()}
