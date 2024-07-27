<!-- The Stack component inserts vertical margins -->

<script lang='ts'>
	const {class: className = '', ...props} = $props();
	// prop classes will override the default classes
	// remaining props will be passed to the root element
</script>


<div 
	class={`stack flex flex-col justify-start space-y-6 ${className}`} 
	{...props}
>
	{@render props.children()}
</div>
