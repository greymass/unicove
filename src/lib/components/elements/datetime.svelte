<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { formatDateTime } from '$lib/utils/intl';

	interface Props {
		datetime: Date;
	}

	let { datetime }: Props = $props();
</script>

{formatDateTime(datetime, getLocale())}
