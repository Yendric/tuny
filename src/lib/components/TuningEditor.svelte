<script lang="ts">
	import { ChevronDown, ChevronUp, Minus, Plus } from '@lucide/svelte';
	import { noteName, octave } from '#lib/notes.js';
	import { MAX_A4, MIN_A4, type Tuning } from '#lib/tunings.js';

	let {
		tuning,
		onsave,
		oncancel,
		ondelete
	}: {
		tuning: Tuning;
		onsave: (tuning: Tuning) => void;
		oncancel: () => void;
		ondelete?: () => void;
	} = $props();

	const MIN_MIDI = 24;
	const MAX_MIDI = 84;

	let draft = $derived.by(() => {
		const copy = $state($state.snapshot(tuning));
		return copy;
	});
	let a4 = $derived<number | undefined>(tuning.a4);
	let name = $derived(draft.name.trim());

	function shift(index: number, by: number) {
		draft.strings[index] = Math.max(MIN_MIDI, Math.min(MAX_MIDI, draft.strings[index] + by));
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (name && a4 !== undefined) onsave({ ...$state.snapshot(draft), name, a4 });
	}
</script>

<form onsubmit={submit} class="flex flex-col gap-6">
	<label class="flex flex-col gap-2">
		<span class="text-sm font-medium text-muted">Name</span>
		<input
			bind:value={draft.name}
			required
			pattern=".*\S.*"
			placeholder="My tuning"
			class="rounded-xl bg-raised px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-accent"
		/>
	</label>

	<fieldset class="flex flex-col gap-2">
		<legend class="mb-2 text-sm font-medium text-muted">Strings (low to high)</legend>
		<div class="grid grid-cols-6 gap-2">
			{#each draft.strings as midi, i (i)}
				<div class="flex flex-col items-center rounded-xl bg-raised">
					<button
						type="button"
						onclick={() => shift(i, 1)}
						aria-label="Raise string {6 - i}"
						class="grid h-10 w-full place-items-center text-muted active:text-accent"
					>
						<ChevronUp />
					</button>
					<span class="text-xl font-semibold"
						>{noteName(midi)}<sub class="text-[0.6em] text-muted">{octave(midi)}</sub></span
					>
					<button
						type="button"
						onclick={() => shift(i, -1)}
						aria-label="Lower string {6 - i}"
						class="grid h-10 w-full place-items-center text-muted active:text-accent"
					>
						<ChevronDown />
					</button>
				</div>
			{/each}
		</div>
	</fieldset>

	<div class="flex flex-col gap-2">
		<label for="a4" class="text-sm font-medium text-muted">Reference A4 (Hz)</label>
		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => (a4 = Math.max(MIN_A4, (a4 ?? tuning.a4) - 1))}
				aria-label="Lower reference"
				class="grid size-12 place-items-center rounded-xl bg-raised"
			>
				<Minus />
			</button>
			<input
				id="a4"
				type="number"
				bind:value={a4}
				min={MIN_A4}
				max={MAX_A4}
				step="0.1"
				required
				class="w-full rounded-xl bg-raised px-4 py-3 text-center text-lg tabular-nums outline-none focus:ring-2 focus:ring-accent"
			/>
			<button
				type="button"
				onclick={() => (a4 = Math.min(MAX_A4, (a4 ?? tuning.a4) + 1))}
				aria-label="Raise reference"
				class="grid size-12 place-items-center rounded-xl bg-raised"
			>
				<Plus />
			</button>
		</div>
	</div>

	<div class="flex gap-2">
		{#if ondelete}
			<button
				type="button"
				onclick={ondelete}
				class="rounded-full px-5 py-3 font-semibold text-red-500 active:bg-raised">Delete</button
			>
		{/if}
		<button
			type="button"
			onclick={oncancel}
			class="ml-auto rounded-full px-5 py-3 font-semibold text-muted active:bg-raised"
			>Cancel</button
		>
		<button type="submit" class="rounded-full bg-accent px-6 py-3 font-semibold text-on-accent"
			>Save</button
		>
	</div>
</form>
