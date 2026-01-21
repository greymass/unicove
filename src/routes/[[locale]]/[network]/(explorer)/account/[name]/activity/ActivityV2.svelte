<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Name } from '@wharfkit/antelope';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		ChevronDownIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		FilterIcon,
		GridIcon,
		ListIcon,
		TableIcon,
		XIcon,
		ChevronsUpDownIcon
	} from '@lucide/svelte';

	import { Activity2Loader } from './state.v2.svelte.js';
	import { getActionSummaryComponent } from '$lib/components/summary/index.js';
	import {
		Button,
		Card,
		Chip,
		Label,
		Stack,
		NameInput,
		Select,
		type ExtendedSelectOption
	} from 'unicove-components';
	import Trace from '$lib/components/elements/trace.svelte';
	import Transaction from '$lib/components/elements/transaction.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import GenericSummary from '$lib/components/summary/generic.svelte';
	import type { ActionDisplayVariants } from '$lib/types.js';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { formatDateTime } from '$lib/utils/intl';

	import type { PageData } from './$types';

	interface Props {
		data: PageData;
		onError?: () => void;
	}

	const { data, onError }: Props = $props();

	const networkName = String(data.network);
	const context = getContext<UnicoveContext>('state');

	function getUrlParams() {
		const params = page.url.searchParams;
		const limitParam = params.get('limit');
		return {
			contract: params.get('contract') || '',
			action: params.get('action') || '',
			startDate: params.get('start_date') || '',
			endDate: params.get('end_date') || '',
			order: (params.get('order') as 'asc' | 'desc') || 'desc',
			limit: limitParam ? parseInt(limitParam, 10) : 20,
			cursor: params.get('cursor') || ''
		};
	}

	function updateUrl(options: Record<string, string | number>) {
		const url = new URL(page.url);
		const defaults: Record<string, string | number> = { order: 'desc', limit: 20 };
		const keyMap: Record<string, string> = { startDate: 'start_date', endDate: 'end_date' };

		for (const [key, value] of Object.entries(options)) {
			const paramKey = keyMap[key] || key;
			if (value && value !== defaults[key]) {
				url.searchParams.set(paramKey, String(value));
			} else {
				url.searchParams.delete(paramKey);
			}
		}
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	}

	onMount(() => {
		const urlParams = getUrlParams();

		if (urlParams.contract) {
			contractFilter = Name.from(urlParams.contract);
			contractInput?.set(urlParams.contract);
			contractValid = true;
		}
		if (urlParams.action) {
			actionFilter = Name.from(urlParams.action);
			actionInput?.set(urlParams.action);
			actionValid = true;
		}
		if (urlParams.startDate) startDateFilter = urlParams.startDate;
		if (urlParams.endDate) endDateFilter = urlParams.endDate;
		if (urlParams.order) orderFilter = urlParams.order;
		if (urlParams.limit) limitFilter = urlParams.limit;

		if (
			urlParams.contract ||
			urlParams.action ||
			urlParams.startDate ||
			urlParams.endDate ||
			urlParams.order !== 'desc'
		) {
			filtersOpen = true;
		}

		const loader = Activity2Loader.getInst(networkName, data.network.fetch);
		loader.setAccount(String(data.name));
		loader.setContract(urlParams.contract);
		loader.setAction(urlParams.action);

		if (urlParams.startDate && urlParams.endDate && urlParams.startDate === urlParams.endDate) {
			loader.setDate(urlParams.startDate);
			loader.setDateRange('', '');
		} else {
			loader.setDate('');
			loader.setDateRange(urlParams.startDate, urlParams.endDate);
		}

		loader.setOrder(urlParams.order);
		loader.setLimit(urlParams.limit);
		loader.load(urlParams.cursor);
	});

	const activityLoader = $derived(Activity2Loader.getInst(networkName, data.network.fetch));

	const isLoading = $derived(activityLoader.scene.isLoading && !activityLoader.scene.list.length);
	const hasNext = $derived(activityLoader.scene.hasNext);
	const hasPrev = $derived(activityLoader.scene.hasPrev);
	const pageIsLoading = $derived(activityLoader.scene.isLoading);
	const activityActions = $derived([...activityLoader.scene.list]);

	$effect(() => {
		if (activityLoader.scene.error && onError) {
			onError();
		}
	});

	function clickNext() {
		const nextCursor = activityLoader.scene.nextCursor;
		activityLoader.loadNext();
		scrollToTop();

		updateUrl({
			contract: String(contractFilter),
			action: String(actionFilter),
			startDate: startDateFilter,
			endDate: endDateFilter,
			order: orderFilter,
			limit: limitFilter,
			cursor: nextCursor || ''
		});
	}

	function clickPrev() {
		const prevCursor = activityLoader.scene.prevCursor;
		activityLoader.loadPrev();
		scrollToTop();

		updateUrl({
			contract: String(contractFilter),
			action: String(actionFilter),
			startDate: startDateFilter,
			endDate: endDateFilter,
			order: orderFilter,
			limit: limitFilter,
			cursor: prevCursor || ''
		});
	}

	let variant: ActionDisplayVariants = $derived(
		(context.settings.data.actionDisplayVariant as ActionDisplayVariants) || 'table'
	);

	function setVariant(v: ActionDisplayVariants) {
		context.settings.data.actionDisplayVariant = v;
	}

	let controlBarEl: HTMLElement | undefined = $state();

	function scrollToTop() {
		const shouldScroll = window.scrollY > 100;
		if (!shouldScroll) return;
		setTimeout(() => {
			if (!controlBarEl) return;
			const rect = controlBarEl.getBoundingClientRect();
			const targetY = window.scrollY + rect.top;
			window.scrollTo({ top: targetY, behavior: 'smooth' });
		}, 50);
	}

	let filtersOpen = $state(false);
	let expandedRows = $state(new Set<string>());
	let overflowingRows = $state(new Set<string>());

	function checkOverflow(node: HTMLElement, rowKey: string) {
		const check = () => {
			if (node.scrollHeight > node.clientHeight + 4) {
				overflowingRows.add(rowKey);
				overflowingRows = new Set(overflowingRows);
			}
		};
		check();
		return { destroy() {} };
	}

	let contractInput: NameInput | undefined = $state();
	let contractValid = $state(false);
	let contractFilter = $state(Name.from(''));

	let actionInput: NameInput | undefined = $state();
	let actionValid = $state(false);
	let actionFilter = $state(Name.from(''));

	let startDateFilter = $state('');
	let endDateFilter = $state('');
	let orderFilter = $state<'asc' | 'desc'>('desc');
	let limitFilter = $state<number>(20);

	const limitOptions: ExtendedSelectOption[] = [
		{ label: '10', value: 10 },
		{ label: '20', value: 20 },
		{ label: '50', value: 50 }
	];

	const orderOptions: ExtendedSelectOption[] = [
		{ label: 'Newest First', value: 'desc' },
		{ label: 'Oldest First', value: 'asc' }
	];

	const selectedLimit = $derived(
		limitOptions.find((o) => o.value === limitFilter) || limitOptions[1]
	);
	const selectedOrder = $derived(
		orderOptions.find((o) => o.value === orderFilter) || orderOptions[0]
	);

	const activeFilterCount = $derived.by(() => {
		let count = 0;
		if (contractValid && !contractFilter.equals(Name.from(''))) count++;
		if (actionValid && !actionFilter.equals(Name.from(''))) count++;
		if (startDateFilter || endDateFilter) count++;
		if (orderFilter !== 'desc') count++;
		return count;
	});

	const filterable = $derived(
		contractValid || startDateFilter || endDateFilter || orderFilter !== 'desc'
	);

	function filter() {
		activityLoader.scene.reset();
		activityLoader.setAccount(String(data.name));
		activityLoader.setContract(String(contractFilter));
		activityLoader.setAction(String(actionFilter));

		if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
			activityLoader.setDate(startDateFilter);
			activityLoader.setDateRange('', '');
		} else {
			activityLoader.setDate('');
			activityLoader.setDateRange(startDateFilter, endDateFilter);
		}

		activityLoader.setOrder(orderFilter);
		activityLoader.setLimit(limitFilter);
		activityLoader.load();

		if (activeFilterCount === 0) {
			filtersOpen = false;
		}

		updateUrl({
			contract: String(contractFilter),
			action: String(actionFilter),
			startDate: startDateFilter,
			endDate: endDateFilter,
			order: orderFilter,
			limit: limitFilter,
			cursor: ''
		});
	}

	function reset() {
		contractFilter = Name.from('');
		contractInput?.set('');
		actionFilter = Name.from('');
		actionInput?.set('');
		startDateFilter = '';
		endDateFilter = '';
		orderFilter = 'desc';
		limitFilter = 20;
		activityLoader.scene.reset();
		activityLoader.setAccount(String(data.name));
		activityLoader.setContract('');
		activityLoader.setAction('');
		activityLoader.setDate('');
		activityLoader.setDateRange('', '');
		activityLoader.setOrder('desc');
		activityLoader.setLimit(20);
		activityLoader.load();

		updateUrl({
			contract: '',
			action: '',
			startDate: '',
			endDate: '',
			order: 'desc',
			limit: 20,
			cursor: ''
		});
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && filterable) {
			filter();
		}
	}

	function toggleFilters() {
		filtersOpen = !filtersOpen;
	}

	function handleLimitChange({ next }: { next: ExtendedSelectOption | undefined }) {
		if (next && next.value !== limitFilter) {
			limitFilter = next.value as number;
			activityLoader.scene.reset();
			activityLoader.setLimit(limitFilter);
			activityLoader.load();

			updateUrl({
				contract: String(contractFilter),
				action: String(actionFilter),
				startDate: startDateFilter,
				endDate: endDateFilter,
				order: orderFilter,
				limit: limitFilter,
				cursor: ''
			});
		}
		return next;
	}

	function handleOrderChange({ next }: { next: ExtendedSelectOption | undefined }) {
		if (next) {
			orderFilter = next.value as 'asc' | 'desc';
		}
		return next;
	}
</script>

<Stack class="py-4">
	<div
		bind:this={controlBarEl}
		class="bg-surface-container-low border-outline-variant flex flex-col gap-3 rounded-xl border p-3"
	>
		<div class="flex flex-wrap items-center gap-3">
			<div class="border-outline-variant flex items-center rounded-lg border">
				<button
					onclick={() => setVariant('summary')}
					class="flex items-center gap-1.5 rounded-l-lg px-3 py-2 text-sm font-medium transition-colors {variant ===
					'summary'
						? 'bg-primary text-on-primary'
						: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}"
					title="Summary view"
				>
					<ListIcon size={16} />
					<span class="hidden md:inline">Summary</span>
				</button>
				<button
					onclick={() => setVariant('table')}
					class="border-outline-variant flex items-center gap-1.5 border-x px-3 py-2 text-sm font-medium transition-colors {variant ===
					'table'
						? 'bg-primary text-on-primary'
						: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}"
					title="Table view"
				>
					<TableIcon size={16} />
					<span class="hidden md:inline">Table</span>
				</button>
				<button
					onclick={() => setVariant('pretty')}
					class="flex items-center gap-1.5 rounded-r-lg px-3 py-2 text-sm font-medium transition-colors {variant ===
					'pretty'
						? 'bg-primary text-on-primary'
						: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}"
					title="Action Data view"
				>
					<GridIcon size={16} />
					<span class="hidden md:inline">Data</span>
				</button>
			</div>

			<div class="flex items-center gap-2">
				<button
					onclick={toggleFilters}
					class="text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
				>
					<FilterIcon size={16} />
					<span class="hidden sm:inline">Filters</span>
					{#if activeFilterCount > 0}
						<Chip class="bg-primary text-on-primary h-5 min-w-5 px-1.5 text-xs font-semibold">
							{activeFilterCount}
						</Chip>
					{/if}
					<ChevronDownIcon
						size={16}
						class="transition-transform duration-200 {filtersOpen ? 'rotate-180' : ''}"
					/>
				</button>

				{#if activityLoader?.filtering}
					<button
						onclick={reset}
						class="text-on-surface-variant hover:text-on-surface flex items-center gap-1 text-sm"
					>
						<XIcon size={14} />
						<span class="hidden sm:inline">Clear</span>
					</button>
				{/if}
			</div>

			<div class="ml-auto flex items-center gap-2">
				<Select
					id="limit-filter"
					options={limitOptions}
					selected={selectedLimit}
					onSelectedChange={handleLimitChange}
				/>
				<div class="border-outline-variant flex items-center rounded-lg border">
					<button
						onclick={clickPrev}
						disabled={!hasPrev || pageIsLoading}
						class="flex items-center gap-1 rounded-l-lg px-2 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed {hasPrev &&
						!pageIsLoading
							? 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
							: 'text-on-surface-variant/40'}"
						title="Previous page"
					>
						<ChevronLeftIcon size={16} />
						<span class="hidden sm:inline">Prev</span>
					</button>
					<span class="bg-outline-variant h-5 w-px"></span>
					<button
						onclick={clickNext}
						disabled={!hasNext || pageIsLoading}
						class="flex items-center gap-1 rounded-r-lg px-2 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed {hasNext &&
						!pageIsLoading
							? 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
							: 'text-on-surface-variant/40'}"
						title="Next page"
					>
						<span class="hidden sm:inline">Next</span>
						<ChevronRightIcon size={16} />
					</button>
				</div>
			</div>
		</div>

		{#if filtersOpen}
			<div class="border-outline-variant border-t pt-3">
				<div class="grid gap-4">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
						<div class="flex flex-col gap-1.5">
							<Label for="contract-input">Contract</Label>
							<NameInput
								bind:this={contractInput}
								bind:value={contractFilter}
								bind:valid={contractValid}
								id="contract-input"
								placeholder="e.g. eosio.token"
								onkeypress={handleKeyPress}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<Label for="action-input">Action</Label>
							<NameInput
								bind:this={actionInput}
								bind:value={actionFilter}
								bind:valid={actionValid}
								id="action-input"
								placeholder="e.g. transfer"
								onkeypress={handleKeyPress}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<Label for="start-date-input">From Date</Label>
							<input
								type="date"
								id="start-date-input"
								bind:value={startDateFilter}
								onkeypress={handleKeyPress}
								class="date-input bg-surface-container border-outline-variant focus:text-on-surface h-10 w-full rounded-lg border px-3 text-sm {startDateFilter
									? 'has-value'
									: ''}"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<Label for="end-date-input">To Date</Label>
							<input
								type="date"
								id="end-date-input"
								bind:value={endDateFilter}
								onkeypress={handleKeyPress}
								class="date-input bg-surface-container border-outline-variant focus:text-on-surface h-10 w-full rounded-lg border px-3 text-sm {endDateFilter
									? 'has-value'
									: ''}"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<Label for="order-input">Sort Order</Label>
							<Select
								id="order-input"
								options={orderOptions}
								selected={selectedOrder}
								onSelectedChange={handleOrderChange}
							/>
						</div>
					</div>

					<div class="flex items-center justify-end gap-2">
						<Button variant="secondary" class="h-9" onclick={reset}>Reset</Button>
						<Button class="h-9" onclick={filter} disabled={!filterable}>Apply Filters</Button>
					</div>
				</div>
			</div>
		{/if}
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center gap-4 py-20">
			<div class="bounce bounce-1 h-3 w-3 rounded-full bg-white"></div>
			<div class="bounce bounce-2 h-3 w-3 rounded-full bg-white"></div>
			<div class="bounce bounce-3 h-3 w-3 rounded-full bg-white"></div>
		</div>
	{:else if !activityActions.length}
		<div class="flex items-center justify-center py-20">
			<p class="text-center text-gray-400">
				{#if activityLoader?.filtering}
					No actions found matching the filter criteria.
				{:else}
					No activity found for this account.
				{/if}
			</p>
		</div>
	{:else}
		{#if variant === 'table'}
			<Card class="overflow-hidden p-0">
				<div
					class="text-on-surface-variant/70 hidden text-xs font-medium tracking-wide uppercase md:flex"
				>
					<div class="w-44 shrink-0 px-4 py-3">Date</div>
					<div class="w-40 shrink-0 px-4 py-3">Action</div>
					<div class="flex-1 px-4 py-3">Details</div>
				</div>
				<div class="divide-outline-variant/40 divide-y">
					{#each activityActions as activityAction}
						{@const contract = String(activityAction.trace.action.account)}
						{@const action = String(activityAction.trace.action.name)}
						{@const datetime = activityAction.trace.block_time.toDate()}
						{@const trxId = activityAction.trace.trx_id}
						{@const rowKey = `${trxId}-${activityAction.trace.receipt.global_sequence}`}
						{@const isExpanded = expandedRows.has(rowKey)}
						{@const summary = getActionSummaryComponent(
							contract,
							action,
							activityAction.trace.act.data
						)}
						<div class="hover:bg-surface-container-high/50 transition-colors">
							<div class="flex flex-col gap-2 p-4 md:flex-row md:items-start md:gap-0">
								<div
									class="flex items-center gap-3 md:w-44 md:shrink-0 md:flex-col md:items-start md:gap-1"
								>
									<div class="text-sm tabular-nums">
										{formatDateTime(datetime, data.locale || 'en', {
											dateStyle: 'short',
											timeStyle: 'short'
										})}
									</div>
									<div class="text-on-surface-variant font-mono text-xs md:block">
										<Transaction id={trxId} />
									</div>
								</div>
								<div
									class="flex items-center gap-2 md:w-40 md:shrink-0 md:flex-col md:items-start md:gap-0.5"
								>
									<span
										class="bg-surface-container text-on-surface rounded px-2 py-0.5 text-sm font-medium"
									>
										<Contract name={Name.from(contract)} action={Name.from(action)}>
											{action}
										</Contract>
									</span>
									<span class="text-on-surface-variant text-xs">
										<Contract name={Name.from(contract)}>
											{contract}
										</Contract>
									</span>
								</div>
								<div class="@container min-w-0 flex-1 text-sm md:pl-4">
									<div class="relative">
										<div
											use:checkOverflow={rowKey}
											class="overflow-hidden transition-all {isExpanded ? '' : 'max-h-20'}"
										>
											{#if summary}
												{@const SummaryComponent = summary}
												<SummaryComponent
													action={activityAction.trace.action}
													data={activityAction.trace.act.data}
													perspectiveOf={Name.from(data.name)}
												/>
											{:else if activityAction.trace.act.data}
												<GenericSummary data={activityAction.trace.act.data} />
											{/if}
										</div>
										{#if overflowingRows.has(rowKey) && !isExpanded}
											<div
												class="from-surface-container-lowest pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t to-transparent"
											></div>
										{/if}
									</div>
									{#if overflowingRows.has(rowKey) || isExpanded}
										<button
											onclick={() => {
												if (isExpanded) {
													expandedRows.delete(rowKey);
												} else {
													expandedRows.add(rowKey);
												}
												expandedRows = new Set(expandedRows);
											}}
											class="text-primary hover:text-primary/80 hover:bg-primary/10 mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium transition-colors"
										>
											<ChevronsUpDownIcon size={14} />
											{isExpanded ? 'Show less' : 'Show more'}
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</Card>
		{:else}
			<ol class="grid gap-12">
				{#each activityActions as activityAction}
					{@const contract = String(activityAction.trace.action.account)}
					{@const action = String(activityAction.trace.action.name)}
					{@const summary = getActionSummaryComponent(
						contract,
						action,
						activityAction.trace.act.data
					)}
					<li class="">
						<Trace
							perspectiveOf={Name.from(data.name)}
							trace={activityAction.trace}
							{summary}
							date
							trxid
							{variant}
						/>
					</li>
				{/each}
			</ol>
		{/if}
		{#if hasPrev || hasNext}
			<div class="flex justify-center gap-4">
				<Button onclick={clickPrev} disabled={!hasPrev || pageIsLoading}>← Prev</Button>
				<Button onclick={clickNext} disabled={!hasNext || pageIsLoading}>Next →</Button>
			</div>
		{/if}
	{/if}
</Stack>

<style>
	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-10px);
		}
		60% {
			transform: translateY(-5px);
		}
	}

	.bounce {
		animation: bounce 1.4s infinite ease-in-out;
	}

	.bounce-1 {
		animation-delay: 0s;
	}

	.bounce-2 {
		animation-delay: 0.2s;
	}

	.bounce-3 {
		animation-delay: 0.4s;
	}

	.date-input {
		color-scheme: dark;
	}

	.date-input::-webkit-datetime-edit {
		color: rgb(var(--color-on-surface-variant) / 0.7);
	}

	.date-input.has-value::-webkit-datetime-edit {
		color: rgb(var(--color-on-surface));
	}

	.date-input::-webkit-calendar-picker-indicator {
		filter: invert(0.7);
	}
</style>
