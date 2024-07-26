<script lang='ts'>
interface Props {
	disabled?: boolean;
	placeholder?: string;
	autoFocus?: boolean;
	input: string;
	value: string;
}

import {createLabel, melt} from '@melt-ui/svelte'

const { elements: {root}} = createLabel()

let {value = $bindable(), ...props} : Props = $props();

</script>

<input class='py-4 px-4 rounded-lg bg-transparent outline outline-1 outline-gray-700 focus:outline-none focus:ring focus:ring-inset focus:ring-blue-500' type="text" value={value} {...props}/>
