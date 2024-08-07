<script>
	import { Card, Center, Cluster, Grid, Sidebar, Stack, Switcher } from '$lib/components/layout';
</script>

<Stack id="layout" class="space-y-8">
	<div>
		<h2 class="h2 mb-4">Layout Components</h2>
		<p>These are the basic layout components designed to be:</p>
		<ul class="list-disc list-inside">
			<li>Atomically Composable</li>
			<li>Intrisically Responsive</li>
			<li>Accessible</li>
		</ul>
		<p>We should default to these to create the structure of pages and other components.</p>
	</div>

	<Stack>
		<h3 class="h3">Box</h3>
		<Card>
			<p>
				Adds default padding to both horizontal and vertical axes. The Card component is an example
				of a Box with some additional styling.
			</p>
		</Card>
	</Stack>

	<Stack>
		<h3 class="h3">Center</h3>
		<Center>
			<Card class="box-content max-w-prose">
				<Stack>
					<p>
						Switches the context to content-box and centers the element. No padding by default so
						add a px-4 or similar to avoid being flush to the edge, depending on context.
					</p>
					<p>
						Includes a default maximum width which can be overridden with the max-w- tailwind class.
					</p>
					<p class="text-center">
						Centering text inside a Center component is simply done with a text-center tailwind
						class on the child, allowing more flexibility depending on context.
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
			<Card>
				<p>Child 1</p>
			</Card>
			<Card>
				<p>Child 2</p>
			</Card>
			<Card>
				<p>Child 3</p>
			</Card>
		</Stack>

		<p>You can push items to the top or bottom of the stack by using mt-auto or mb-auto</p>
		<Stack class="h-96">
			<Card>
				<p>Child 1</p>
			</Card>
			<Card>
				<p>Child 2 - Then a big gap to the bottom of the element</p>
			</Card>
			<Card class="mt-auto">
				<p>Child 3</p>
			</Card>
		</Stack>
	</Stack>

	<Stack>
		<h3 class="h3">Sidebar</h3>
		<p>
			The Sidebar is used for two horizontally adjecent elements: one smaller and fixed width, the
			other filling the remaining space. In a narrow context the elements will stack vertically.
		</p>
		<p>It is a common pattern to use a Sidebar with a Stack to create a page layout.</p>
		<Sidebar.Root>
			<Sidebar.Side width="20rem" tag="aside">
				<Card title="Sidebar">
					<p>This is the sidebar content set to 20rem</p>
				</Card>
			</Sidebar.Side>
			<Sidebar.Content tag="main" threshold="50%">
				<Card title="Main Content" class="">
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
			We can also have the Sidebar on the right side, and choose to wrap above or below the main
			content with flex-wrap-reverse
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
			Clusters children horizontally with a default gap. The cluster will re-flow when the screen
			size changes.
		</p>
		<p>This is essentially just typical flex-wrap behaviour with some default gaps.</p>
		<p>Note: no leading or trailing horizontal gap.</p>
		<Cluster>
			<Card>
				<p>Child 1</p>
			</Card>
			<Card>
				<p>Child 2 is larger</p>
			</Card>
			<Card>
				<p>Child 3 is also large</p>
			</Card>
			<Card>
				<p>Child 4</p>
			</Card>
			<Card>
				<p>Child 5</p>
			</Card>
			<Card>
				<p>Child 6</p>
			</Card>
		</Cluster>
	</Stack>

	<Stack>
		<h3 class="h3">Switcher</h3>
		<p>
			The Switcher switches a flexbox context between horizontal and a vertical layout at a given,
			parent container-based breakpoint.
		</p>
		<p>
			For example, if the breakpoint is 30rem the layout will switch to vertical when the parent
			container itself is less than 30rem wide.
		</p>
		<p>
			This layout is useful when all elements inside the switcher are considered of equal
			importance.
		</p>

		<Switcher threshold="30rem">
			<Card>
				<p>Child 1</p>
			</Card>
			<Card>
				<p>Child 2</p>
			</Card>
			<Card>
				<p>Child 3</p>
			</Card>
		</Switcher>
	</Stack>

	<Stack>
		<h3 class="h3">Grid</h3>
		<p>The Grid component is used to create a grid layout with a default gap between children.</p>
		<p>
			The grid is different from the Cluster component in that all children are the same size and
			will align to columns.
		</p>
		<p>On a small screen, these will form a single column whereas the cluster will not.</p>
		<Grid>
			<Card>
				<p>Child 1</p>
			</Card>
			<Card>
				<p>Child 2</p>
			</Card>
			<Card>
				<p>Child 3</p>
			</Card>
			<Card>
				<p>Child 4</p>
			</Card>
			<Card>
				<p>Child 5</p>
			</Card>
		</Grid>
	</Stack>
</Stack>
