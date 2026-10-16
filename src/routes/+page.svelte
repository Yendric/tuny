<script lang="ts">
	import { ChevronRight, Mic, RotateCcw } from '@lucide/svelte';
	import Headstock from '#lib/components/Headstock.svelte';
	import Meter from '#lib/components/Meter.svelte';
	import TuningSheet from '#lib/components/TuningSheet.svelte';
	import { noteName } from '#lib/notes.js';
	import { Tuner } from '#lib/tuner.svelte.js';

	const tuner = new Tuner();
	let sheetOpen = $state(false);
	let tuning = $derived(tuner.tunings.selected);
</script>

<svelte:head>
	<title>Tuny · {tuning.name}</title>
</svelte:head>

<svelte:document
	onvisibilitychange={() => {
		if (document.visibilityState === 'visible') void tuner.resume();
	}}
/>

<main
	class="mx-auto flex h-dvh max-w-lg flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] select-none"
>
	<header class="flex items-start justify-between px-5 pt-4">
		<div>
			<h1 class="text-4xl font-bold tracking-tight">tun<span class="text-accent">y</span></h1>
			<button
				type="button"
				onclick={() => (sheetOpen = true)}
				class="mt-2 flex flex-col items-start text-left"
			>
				<span class="flex items-center gap-1 text-lg font-semibold">
					{tuning.name}
					<ChevronRight class="size-5 text-muted" />
				</span>
				<span class="text-sm text-muted">
					{tuning.strings.map(noteName).join(' ')} · {tuning.a4} Hz
				</span>
			</button>
		</div>
		<label class="flex items-center gap-3 pt-2 text-sm font-semibold tracking-widest text-muted">
			AUTO
			<input
				type="checkbox"
				role="switch"
				bind:checked={tuner.auto}
				class="relative h-8 w-14 cursor-pointer appearance-none rounded-full bg-raised transition-colors before:absolute before:top-1 before:left-1 before:size-6 before:rounded-full before:bg-white before:shadow before:transition-transform checked:bg-accent checked:before:translate-x-6"
			/>
		</label>
	</header>

	<section class="relative mt-4 min-h-0 flex-1">
		<Meter {tuner} />

		{#if tuner.status !== 'listening'}
			<div class="absolute inset-0 grid place-items-center bg-bg/70 p-6 backdrop-blur-sm">
				<div class="flex flex-col items-center gap-4 text-center">
					<button
						type="button"
						onclick={() => tuner.start()}
						disabled={tuner.status === 'starting'}
						aria-label="Start tuning"
						class="grid size-20 place-items-center rounded-full bg-accent text-on-accent shadow-lg shadow-accent/30 transition active:scale-95 disabled:opacity-60"
					>
						<Mic class="size-9" />
					</button>
					<p class="max-w-64 text-muted">
						{#if tuner.status === 'denied'}
							Microphone access is blocked. Allow it in your browser settings and try again.
						{:else if tuner.status === 'error'}
							Couldn't open the microphone. Tap to try again.
						{:else}
							Tap to start listening
						{/if}
					</p>
				</div>
			</div>
		{/if}
	</section>

	<section class="relative shrink-0">
		<Headstock {tuner} />
		{#if tuner.tuned.size}
			<button
				type="button"
				onclick={() => tuner.reset()}
				class={[
					'absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-6 py-3 font-semibold shadow-lg transition',
					tuner.tuned.size === tuning.strings.length
						? 'bg-good text-on-good'
						: 'bg-accent text-on-accent'
				]}
			>
				<RotateCcw class="size-5" /> Start over
			</button>
		{/if}
	</section>
</main>

<TuningSheet tunings={tuner.tunings} bind:open={sheetOpen} />
