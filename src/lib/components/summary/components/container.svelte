<script lang="ts">
	let props = $props();
</script>

<div class="grid gap-y-4 @2xl:grid-cols-[auto_auto_1fr]">
	{@render props.children()}
</div>
