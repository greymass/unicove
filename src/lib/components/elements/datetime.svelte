<script lang="ts">
	import { languageTag } from '$lib/paraglide/runtime';

	interface Props {
		datetime: Date;
	}

	let { datetime }: Props = $props();

	let locale = $derived.by(() => {
		const tag = languageTag();
		switch (tag) {
			case 'en':
				return 'en-US';
			case 'zh':
				return 'zh-CN';
			case 'ko':
				return 'ko-KR';
			default:
				return 'en-US';
		}
	});
</script>

{new Intl.DateTimeFormat(locale, {
	dateStyle: 'full',
	timeStyle: 'long'
}).format(datetime)}
