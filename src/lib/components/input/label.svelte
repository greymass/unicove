<script lang='ts'>
interface Props {
	for: string
}
import {createLabel, melt} from '@melt-ui/svelte'

const { elements: {root}} = createLabel()

let props: Props = $props();
</script>


<label for={props.for} use:melt={$root} class='h5 semi-bold'>
	{@render props.children()}
</label>
