<script lang='ts'>
import {createLabel, melt} from '@melt-ui/svelte'

const { elements: {root}} = createLabel()

let props = $props();
</script>


<label use:melt={$root}>
	{props.label}
	<slot></slot>
</label>
