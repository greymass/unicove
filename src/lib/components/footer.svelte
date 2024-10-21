<script lang="ts">
	import UnicoveLogo from '$lib/assets/unicovelogo.svelte';

	// TODO: Add real footer data
	const data = [
		{
			title: 'About',
			links: [
				{ name: 'About Us', href: '#' },
				{ name: 'Our Team', href: '#' },
				{ name: 'Careers', href: '#' },
				{ name: 'Press', href: '#' }
			]
		},
		{
			title: 'Services',
			links: [
				{ name: 'Pricing', href: '#' },
				{ name: 'Documentation', href: '#' },
				{ name: 'API Reference', href: '#' },
				{ name: 'Status', href: '#' }
			]
		},
		{
			title: 'Support',
			links: [
				{ name: 'Help Center', href: '#' },
				{ name: 'Contact Us', href: '#' },
				{ name: 'Privacy Policy', href: '#' },
				{ name: 'Terms of Service', href: '#' }
			]
		},
		{
			title: 'Community',
			links: [
				{ name: 'Blog', href: '#' },
				{ name: 'Forum', href: '#' },
				{ name: 'Events', href: '#' },
				{ name: 'Partners', href: '#' }
			]
		},
		{
			title: 'Social',
			links: [
				{ name: 'Twitter', href: '#' },
				{ name: 'Facebook', href: '#' },
				{ name: 'Instagram', href: '#' },
				{ name: 'LinkedIn', href: '#' }
			]
		},
		{
			title: 'Legal',
			links: [
				{ name: 'Security', href: '#' },
				{ name: 'Compliance', href: '#' },
				{ name: 'GDPR', href: '#' },
				{ name: 'CCPA', href: '#' }
			]
		},
		{
			title: 'Contact',
			links: [
				{ name: 'Contact Us', href: '#' },
				{ name: 'Support', href: '#' },
				{ name: 'Sales', href: '#' },
				{ name: 'Press', href: '#' }
			]
		},
		{
			title: 'More',
			links: [
				{ name: 'Partners', href: '#' },
				{ name: 'Affiliates', href: '#' },
				{ name: 'Sponsorships', href: '#' },
				{ name: 'Careers', href: '#' }
			]
		}
	];
</script>

<footer class="col-span-full mt-20 grid grid-cols-subgrid border-t border-white/10 py-8">
	<nav class="col-span-full grid grid-cols-subgrid gap-y-8">
		<UnicoveLogo wordmark class="justify-self-start md:col-span-2 xl:col-span-1" />
		<menu class="contents">
			{#each data as { title, links }}
				<li class="space-y-2 md:col-span-2 xl:col-span-1">
					<h3 class="text-base font-semibold text-white/60">{title}</h3>
					<ul class="space-y-1">
						{#each links as { name, href }}
							<li>
								<a {href} class=" text-base hover:underline">{name}</a>
							</li>
						{/each}
					</ul>
				</li>
			{/each}
		</menu>
	</nav>
</footer>
