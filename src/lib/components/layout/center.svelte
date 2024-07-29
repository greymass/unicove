<!-- The Center aligns its content horizontally centered -->
<script lang="ts">
	const { class: className = '', children, ...props } = $props();
	// prop classes will override the default classes
	// remaining props will be passed to the root element
</script>

<div class={`center box-content max-w-prose mx-auto ${className}`} {...props}>
	{@render children()}
</div>
