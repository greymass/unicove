<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import TextInput from '$lib/components/input/textinput.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Card from '$lib/components/card.svelte';
	import { Grid, Switcher, Sidebar, Cluster, Center, Box, Stack } from '$lib/components/layout';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';

	let input: AssetInput;

	let value = $state(Asset.from('0.0000 TOKEN'));
	let valid = $state(false);

	let min = $state(1);
	let max = $state(100);
</script>

<Sidebar.Root>
	<Sidebar.Side width="10rem" tag="aside">
		<Stack class="sticky top-4">
			<a href="#typography" class="block">Typography</a>
			<a href="#buttons" class="block">Buttons</a>
			<a href="#inputs" class="block">Inputs</a>
			<a href="#cards" class="block">Cards</a>
			<a href="#navigation" class="block">Navigation</a>
			<a href="#layout" class="block">Layout</a>
		</Stack>
	</Sidebar.Side>
	<Sidebar.Content tag="main" threshold="50%">
		<Stack class="space-y-24">
			<Stack id="typography">
				<h2 class="h2">Typography</h2>
				<h1 class="h1">Heading 1</h1>
				<h2 class="h2">Heading 2</h2>
				<h3 class="h3">Heading 3</h3>
				<h4 class="h4">Heading 4</h4>
				<h5 class="h5">Heading 5</h5>
				<p class="caption">Caption</p>
				<p>
					Paragraph - lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
					incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
					exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
					dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
					Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
					anim id est laborum.
				</p>
			</Stack>

			<div id="buttons">
				<h2 class="h2">Buttons</h2>
				<Button variant="primary" onclick={() => input.set(Asset.from('0.0000 EOS'))}
					>EOS (0)</Button
				>
				<Button variant="secondary" onclick={() => input.set(Asset.from('1.0000 EOS'))}
					>EOS (1)</Button
				>
				<Button variant="pill" onclick={() => input.set(Asset.from('2100000000.0000 EOS'))}>
					EOS (MAX)
				</Button>
			</div>

			<Stack id="inputs">
				<Stack>
					<h2 class="h2">Text Input</h2>
					<div>
						<h3 class="h3">Default</h3>
						<TextInput placeholder="Placeholder text" />
					</div>
					<div>
						<h3 class="h3">With Label</h3>
						<fieldset class="grid gap-3">
							<Label>Enter a value</Label>
							<TextInput placeholder="Placeholder text" />
						</fieldset>
					</div>
				</Stack>

				<div>
					<h2 class="h2">Asset Input</h2>
					<Label for="assetInput">Enter token value:</Label>
					<AssetInput id="assetInput" bind:this={input} bind:value bind:valid bind:min bind:max />
				</div>
			</Stack>

			<Stack id="cards">
				<h2 class="h2">Cards</h2>
				<Box class="grid grid-cols-2 gap-6">
					<Card title="Card Title">
						<table class="w-full">
							<tbody>
								<tr>
									<td>Card Content</td>
									<td>Card Content</td>
								</tr>
								<tr>
									<td>Card Content</td>
									<td>Card Content</td>
								</tr>
							</tbody>
						</table>
					</Card>
				</Box>
			</Stack>

			<Stack id="navigation">
				<h2 class="h2">Navigation Components</h2>
				<h3 class="h3">Pill Group</h3>
				<PillGroup />
			</Stack>

			<Stack id="layout" class="space-y-8">
				<div>
					<h2 class="h2 mb-4">Layout Components</h2>
					<p>These are the basic layout components designed to be:</p>
					<ul class="list-disc list-inside">
						<li>Aomically Composable</li>
						<li>Intrisically Responsive</li>
						<li>Accessible</li>
					</ul>
					<p>We should default to these to create the structure of pages and other components.</p>
				</div>

				<Stack>
					<h3 class="h3">Box</h3>
					<Card>
						<p>
							Adds default padding to both horizontal and vertical axes. The Card component is an
							example of a Box with some additional styling.
						</p>
					</Card>
				</Stack>

				<Stack>
					<h3 class="h3">Center</h3>
					<Center>
						<Card>
							<Stack>
								<p>
									Switches the context to content-box and centers the element. No padding by default
									so add a px-4 or similar to avoid being flush to the edge, depending on context.
								</p>
								<p>
									Includes a default maximum width which can be overridden with the max-w- tailwind
									class.
								</p>
								<p class="text-center">
									Centering text inside a Center component is simply done with a text-center
									tailwind class on the child, allowing more flexibility depending on context.
								</p>
							</Stack>
						</Card>
					</Center>
				</Stack>

				<Stack>
					<h3 class="h3">Stack</h3>
					<p>Stacks children vertically with a default gap.</p>
					<p>Box > Center > Stack will be a common pattern for creating page layouts.</p>
					<p>Note: no leading or trailing vertical gap.</p>
					<Stack>
						<Card class="bg-red-900">
							<p>Child 1</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 2</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 3</p>
						</Card>
					</Stack>

					<p>You can push items to the top or bottom of the stack by using mt-auto or mb-auto</p>
					<Stack class="h-96">
						<Card class="bg-red-900">
							<p>Child 1</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 2 - Then a big gap to the bottom of the element</p>
						</Card>
						<Card class="bg-red-900 mt-auto">
							<p>Child 3</p>
						</Card>
					</Stack>
				</Stack>

				<Stack>
					<h3 class="h3">Sidebar</h3>
					<p>
						The Sidebar is used for two horizontally adjecent elements: one smaller and fixed width,
						the other filling the remaining space. In a narrow context the elements will stack
						vertically.
					</p>
					<p>It is a common pattern to use a Sidebar with a Stack to create a page layout.</p>
					<Sidebar.Root>
						<Sidebar.Side width="20rem" tag="aside">
							<Card title="Sidebar">
								<p>This is the sidebar content set to 20rem</p>
							</Card>
						</Sidebar.Side>
						<Sidebar.Content tag="main" threshold="50%">
							<Card title="Main Content">
								<Stack>
									<p>This is the main content set to break at 50%</p>
									<p>This is the main content</p>
									<p>This is the main content</p>
									<p>This is the main content</p>
								</Stack>
							</Card>
						</Sidebar.Content>
					</Sidebar.Root>

					<p>
						We can also have the Sidebar on the right side, and choose to wrap above or below the
						main content with flex-wrap-reverse
					</p>

					<!-- <Sidebar.Root class='flex-wrap-reverse'> -->
					<Sidebar.Root>
						<Sidebar.Content tag="main" threshold="50%">
							<Card title="Main Content">
								<Stack>
									<p>This is the main content set to break at 50%</p>
									<p>This is the main content</p>
									<p>This is the main content</p>
									<p>This is the main content</p>
								</Stack>
							</Card>
						</Sidebar.Content>
						<Sidebar.Side tag="aside" width="10rem">
							<Card title="Sidebar">
								<p>This is the sidebar content set to 10rem</p>
							</Card>
						</Sidebar.Side>
					</Sidebar.Root>
				</Stack>

				<Stack>
					<h3 class="h3">Cluster</h3>
					<p>
						Clusters children horizontally with a default gap. The cluster will re-flow when the
						screen size changes.
					</p>
					<p>This is essentially just typical flex-wrap behaviour with some default gaps.</p>
					<p>Note: no leading or trailing horizontal gap.</p>
					<Cluster>
						<Card class="bg-red-900">
							<p>Child 1</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 2 is larger</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 3 is also large</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 4</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 5</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 6</p>
						</Card>
					</Cluster>
				</Stack>

				<Stack>
					<h3 class="h3">Switcher</h3>
					<p>
						The Switcher switches a flexbox context between horizontal and a vertical layout at a
						given, parent container-based breakpoint.
					</p>
					<p>
						For example, if the breakpoint is 30rem the layout will switch to vertical when the
						parent container itself is less than 30rem wide.
					</p>
					<p>
						This layout is useful when all elements inside the switcher are considered of equal
						importance.
					</p>

					<Switcher threshold="30rem">
						<Card class="bg-red-900">
							<p>Child 1</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 2</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 3</p>
						</Card>
					</Switcher>
				</Stack>

				<Stack>
					<h3 class="h3">Grid</h3>
					<p>
						The Grid component is used to create a grid layout with a default gap between children.
					</p>
					<p>
						The grid is different from the Cluster component in that all children are the same size
						and will align to columns.
					</p>
					<p>On a small screen, these will form a single column whereas the cluster will not.</p>
					<Grid>
						<Card class="bg-red-900">
							<p>Child 1</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 2</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 3</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 4</p>
						</Card>
						<Card class="bg-red-900">
							<p>Child 5</p>
						</Card>
					</Grid>
				</Stack>
			</Stack>
		</Stack>
	</Sidebar.Content>
</Sidebar.Root>
