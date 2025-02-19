<script lang="ts">
	import { languageTag } from '$lib/paraglide/runtime';
	import { formatDateTime } from '$lib/utils/date';

	interface Props {
		datetime: Date;
	}

	let { datetime }: Props = $props();
</script>

{formatDateTime(datetime, languageTag())}
