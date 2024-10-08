<script lang="ts">
	import { page } from '$app/stores';
</script>

<!-- This error page would get triggered if the user entered an invalid URL like /en/eos/asdf  -->
<!-- TODO: We'll need some alternative styling here since it doesn't inherit any layout from the rest of the site. -->
<pre>{JSON.stringify($page.error, null, 2)}</pre>
