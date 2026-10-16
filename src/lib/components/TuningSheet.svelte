<script lang="ts">
	import { Check, Pencil, Plus, X } from '@lucide/svelte';
	import { noteName } from '#lib/notes.js';
	import type { Tuning } from '#lib/tunings.js';
	import type { TuningStore } from '#lib/tunings.svelte.js';
	import TuningEditor from './TuningEditor.svelte';

	let { tunings, open = $bindable() }: { tunings: TuningStore; open: boolean } = $props();

	let editing = $state<Tuning>();

	function choose(id: string) {
		tunings.select(id);
		open = false;
	}

	function create() {
		const base = tunings.selected;
		editing = { ...base, id: crypto.randomUUID(), name: `${base.name} (custom)` };
	}

	function save(tuning: Tuning) {
		tunings.save(tuning);
		editing = undefined;
		open = false;
	}
</script>

{#snippet item(tuning: Tuning)}
	{@const selected = tuning.id === tunings.selected.id}
	<li class="flex items-center">
		<button
			type="button"
			onclick={() => choose(tuning.id)}
			class="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-left active:bg-raised"
		>
			<span class="flex flex-1 flex-col">
				<span class={['text-lg font-semibold', selected && 'text-accent']}>{tuning.name}</span>
				<span class="text-sm text-muted">
					{tuning.strings.map(noteName).join(' ')}{tuning.a4 === 440 ? '' : ` · ${tuning.a4} Hz`}
				</span>
			</span>
			{#if selected}
				<Check class="text-accent" />
			{/if}
		</button>
		{#if tunings.isCustom(tuning.id)}
			<button
				type="button"
				onclick={() => (editing = tuning)}
				aria-label="Edit {tuning.name}"
				class="grid size-12 place-items-center rounded-full text-muted active:bg-raised"
			>
				<Pencil class="size-5" />
			</button>
		{/if}
	</li>
{/snippet}

<dialog
	{@attach (dialog) => {
		if (open) dialog.showModal();
		else dialog.close();
	}}
	onclose={() => {
		open = false;
		editing = undefined;
	}}
	closedby="any"
	class="m-0 mx-auto mt-auto max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-fg backdrop:bg-black/50 open:animate-sheet"
>
	<header class="mb-2 flex items-center justify-between px-2">
		<h2 class="text-xl font-bold">{editing ? 'Custom tuning' : 'Tunings'}</h2>
		<button
			type="button"
			onclick={() => (open = false)}
			aria-label="Close"
			class="grid size-10 place-items-center rounded-full text-muted active:bg-raised"
		>
			<X />
		</button>
	</header>

	{#if editing}
		{@const tuning = editing}
		<div class="p-2">
			<TuningEditor
				{tuning}
				onsave={save}
				oncancel={() => (editing = undefined)}
				ondelete={tunings.isCustom(tuning.id)
					? () => {
							tunings.remove(tuning.id);
							editing = undefined;
						}
					: undefined}
			/>
		</div>
	{:else}
		<ul>
			{#each tunings.builtIn as tuning (tuning.id)}
				{@render item(tuning)}
			{/each}
		</ul>

		{#if tunings.custom.length}
			<h3 class="mt-4 mb-1 px-4 text-sm font-medium text-muted">Custom</h3>
			<ul>
				{#each tunings.custom as tuning (tuning.id)}
					{@render item(tuning)}
				{/each}
			</ul>
		{/if}

		<button
			type="button"
			onclick={create}
			class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-4 font-semibold text-accent active:bg-raised"
		>
			<Plus class="size-5" /> New custom tuning
		</button>
	{/if}
</dialog>
