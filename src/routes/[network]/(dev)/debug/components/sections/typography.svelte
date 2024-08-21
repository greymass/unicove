<script>
	import { Cluster, Stack } from '$lib/components/layout';
	import PageHeader from '$lib/components/pageheader.svelte';
</script>

<Stack id="typography">
	<h2 class="h2">Typography</h2>
	<p>
		Styles are applied separately from their tag since there will be situations where we want to mix
		and match styles and tags. We want to adhere to valid and semantic html as much as possible, and
		having a utility class to apply heading styles helps us with that goal.
	</p>
	<p>
		For example, some of the designs show the main heading of the page using the style of a second
		heading. This is easily achieved by applying the h2 class to the h1 tag.
	</p>
	<Cluster class="items-center">
		<p class="h1">Heading 1 (Inter 48)</p>
		<code class=" rounded-lg bg-gray-300 p-2 text-black">class='h1'</code>
	</Cluster>
	<Cluster class="items-center">
		<p class="h2">Heading 2 (Inter 32)</p>
		<code class=" rounded-lg bg-gray-300 p-2 text-black">class='h2'</code>
	</Cluster>
	<Cluster class="items-center">
		<p class="h3">Heading 3 (Inter 24)</p>
		<code class=" rounded-lg bg-gray-300 p-2 text-black">class='h3'</code>
	</Cluster>
	<Cluster class="items-center">
		<p class="h4">Heading 4 (Inter 18)</p>
		<code class=" rounded-lg bg-gray-300 p-2 text-black">class='h4'</code>
	</Cluster>
	<Cluster class="items-center">
		<p class="h5">Heading 5 (Inter 16)</p>
		<code class="rounded-lg bg-gray-300 p-2 text-black">class='h5'</code>
	</Cluster>
	<Cluster class="items-center">
		<p class="caption">Caption (Inter 12)</p>
		<code class="rounded-lg bg-gray-300 p-2 text-black">class='caption'</code>
	</Cluster>
	<p>
		Paragraph - lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
		incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
		ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
		in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
		cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
	</p>
</Stack>

<Stack class="gap-8">
	<h2 class="h2">Page Header</h2>
	<PageHeader title="Send" subtitle="Add recipient" />
	<PageHeader title="teamgreymass" subtitle="Account" inverted />
</Stack>
