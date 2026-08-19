<script lang="ts">
	import { Card } from 'unicove-components';

	interface Props {
		englishHref: string;
	}

	const { englishHref }: Props = $props();
</script>

<Card>
	<p>
		This translation was written against an earlier version of the proposal. The English text is the
		normative version. <a class="underline" href={englishHref}>Read it in English</a>.
	</p>
</Card>
