<script lang="ts">
	interface Props {
		title: string;
		text: string;
	}
	let props: Props = $props();
</script>

<header class="col-span-full space-y-2 @3xl:col-span-1">
	<h3 class="h4 font-semibold">{props.title}</h3>
	<p class="max-w-prose text-pretty @3xl:text-balance">{props.text}</p>
</header>
