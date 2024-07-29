<!-- The Stack component inserts vertical margins -->

<script lang="ts">
	const { class: className = '', ...props } = $props();
	// prop classes will override the default classes
	// remaining props will be passed to the root element
</script>

<div class={`stack ${className}`} {...props}>
	{@render props.children()}
</div>

<!-- We need to break out of Tailwind here to allow the stack to be overridden by children components -->
<style>
	.stack {
		display: flex;
		flex-direction: column;
		justify-content: start;
		gap: 1.5rem;
	}
</style>
