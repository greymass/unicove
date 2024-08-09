<script lang="ts">
	import { goto } from '$app/navigation';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { Command } from 'cmdk-sv';
	import { writable } from 'svelte/store';

	let open = writable(false);

	const {
		elements: { trigger, portalled, content, title, description, close }
		// states
	} = createDialog({
		open: open
	});

	const toggleDialog = () => {
		$open = !$open;
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		// Open dialog with cmd+k or /
		if ((event.metaKey && event.key === 'k') || event.key === '/') {
			event.preventDefault();
			toggleDialog();
		}

		if ($open) {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				// focus next item
			}

			if (event.key === 'ArrowUp') {
				event.preventDefault();
				// focus previous item
			}

			if (event.key === 'Enter') {
				event.preventDefault();
				// select item
			}
		}
	};

	const data = {
		links: [
			{ href: '/', label: 'Home' },
			{ href: '/account', label: 'Account' },
			{ href: '/debug/components', label: 'Components' }
		]
	};
</script>

<button use:melt={$trigger}> Open Dialog </button>

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$content}
			class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-[450px]
            -translate-x-1/2 -translate-y-1/2 rounded-xl bg-black
            p-6 shadow-lg"
		>
			<Command.Root class="" label="Command Menu">
				<!-- <p use:melt={$description}>Dialog description</p> -->

				<div class="flex items-center gap-4">
					<Command.Input class="grow" placeholder="Enter a command" />
					<button use:melt={$close}>esc</button>
				</div>

				<Command.List>
					<Command.Empty>No results found.</Command.Empty>

					{#each Object.keys(data) as key}
						<Command.Group heading={key}>
							{#each data[key] as item}
								<Command.Item
									onSelect={() => {
										goto(item.href);
										toggleDialog();
									}}
									class="data-[selected=true]:bg-gray-800"
								>
									{item.label}
								</Command.Item>
							{/each}
						</Command.Group>
					{/each}
				</Command.List>
			</Command.Root>
		</div>
	</div>
{/if}

<svelte:window onkeydown={handleKeyDown} />
