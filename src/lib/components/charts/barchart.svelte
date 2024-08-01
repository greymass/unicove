<script lang='ts'>
  import { VisXYContainer, VisStackedBar, VisTooltip  } from '@unovis/svelte'
	import {StackedBar} from '@unovis/ts'
	import {Card} from '$lib/components/layout'

	type DataRecord = {
		x: string
		y: number
		y1: number
		y2: number
	}

	interface Props {
		data: DataRecord[]
		title: string
	}

	const {data, ...props}: Props = $props()

  const x = (d: DataRecord) => d.x
  const y = [
    (d: DataRecord) => d.y,
    (d: DataRecord) => d.y1,
  ]
	const triggers = {
		[StackedBar.selectors.bar]: (d: DataRecord) => `<span>${d.x}</span>`
	}

	const colors = ["#00ED97", "#B2FAE0"]
</script>

<Card class=''>
	<p class='h3 font-semibold'>{props.title || 'Test'}</p>
	<VisXYContainer {data}>
		<VisStackedBar
			barPadding={0.2}
			color={colors}
			{x} {y}
		/>
		<!-- <VisTooltip {triggers} /> -->
	</VisXYContainer>
	<hr class="mt-1.5 h-px bg-shark-200/50 border-0" />
	<div class='flex justify-between items-center font-medium'>
		<span class='text-shark-200/70'>{data.length} days</span>
		<div class='flex gap-4'>
			<div class='flex items-center gap-1'>
				<div class='size-4 bg-[#00ED97] rounded'></div>
				<span class='text-[#00ED97]'>Staked</span>
			</div>
			<div class='flex items-center gap-1'>
				<div class='size-4 bg-[#B2FAE0] rounded'></div>
				<span class='text-[#B2FAE0]'>Yield</span>
			</div>
		</div>
		<span class='text-shark-200/70'>Today</span>
	</div>
</Card>
