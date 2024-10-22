<script lang="ts">
	import { page } from '$app/stores';
</script>

<!-- This error page gets triggered if any of the routes in the sibling directories fail -->
<!-- TODO: this page needs a design still -->

{#if $page.error?.code === 'NOT_FOUND'}
	<h1 class="h1">{$page.error.message}</h1>
{:else}
	<pre>{JSON.stringify($page.error, null, 2)}</pre>
{/if}
