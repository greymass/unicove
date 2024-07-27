<!-- The Cluster is used for groups of elements that differ in length, should be aligned horizontally, and are liable to wrap in small screen contexts. E.g. Buttons, Tags, Keywords, etc. -->

<script lang='ts'>
	const {class: className = '', ...props} = $props();
	// prop classes will override the default classes
	// remaining props will be passed to the root element
</script>


<div class={`cluster flex flex-wrap gap-4 ${className}`} {...props}>
	{@render props.children()}
</div>
