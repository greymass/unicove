<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<!-- 
  This section is commented out because the corresponding load method in +page.ts is also commented out.
  Once the load method is implemented and returning the expected data, we can uncomment and use this part.
-->

<!-- <h1>{data.proposer}/{data.name}</h1>
 -->
<pre>
{JSON.stringify(data.proposal, null, 2)}
</pre>
