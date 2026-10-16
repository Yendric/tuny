<script lang="ts">
	import { Check } from '@lucide/svelte';
	import { noteName, octave } from '#lib/notes.js';
	import type { Tuner } from '#lib/tuner.svelte.js';

	let { tuner }: { tuner: Tuner } = $props();

	const ROWS = [100, 190, 280];
	const NUT_Y = 350;

	const pegs = [0, 1, 2, 3, 4, 5].map((i) => {
		const left = i < 3;
		return {
			index: i,
			left,
			x: left ? 150 : 250,
			y: ROWS[left ? 2 - i : i - 3],
			nutX: 177 + i * 9.2,
			width: 2.8 - i * 0.35
		};
	});

	let ringing = $derived(tuner.frequency !== null);
</script>

<div class="relative mx-auto aspect-square w-[min(100%,420px,45dvh)]">
	<svg viewBox="0 0 400 400" class="absolute inset-0 size-full" aria-hidden="true">
		<defs>
			<linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#c47a3a" />
				<stop offset="0.55" stop-color="#8f4a1c" />
				<stop offset="1" stop-color="#5e2c0f" />
			</linearGradient>
			<linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#f4f1ec" />
				<stop offset="0.45" stop-color="#a9a49c" />
				<stop offset="1" stop-color="#e6e2db" />
			</linearGradient>
		</defs>

		{#each pegs as peg (peg.index)}
			{@const keyX = peg.left ? 76 : 290}
			<rect x={peg.left ? 108 : 280} y={peg.y - 5} width="12" height="10" fill="#bdb7ad" />
			<rect x={keyX} y={peg.y - 22} width="34" height="44" rx="13" fill="url(#chrome)" />
		{/each}

		<path
			d="M172 400 L172 350 C150 335 128 315 124 285 L116 80 C114 50 140 22 168 20 C185 19 194 30 200 36 C206 30 215 19 232 20 C260 22 286 50 284 80 L276 285 C272 315 250 335 228 350 L228 400 Z"
			fill="url(#wood)"
			stroke="#f1dcbc"
			stroke-width="3"
		/>
		<path d="M189 346 C189 318 195 300 200 300 C205 300 211 318 211 346 Z" fill="#2a160a" />
		<text
			x="200"
			y="74"
			text-anchor="middle"
			class="font-sans text-[26px] font-bold tracking-tight"
			fill="#f1dcbc">tuny</text
		>
		<rect x="170" y={NUT_Y - 3} width="60" height="6" rx="2" fill="#efe6d4" />

		{#each pegs as peg (peg.index)}
			{@const active = peg.index === tuner.stringIndex}
			<polyline
				points="{peg.x},{peg.y} {peg.nutX},{NUT_Y} {peg.nutX},400"
				fill="none"
				stroke={active ? 'var(--accent)' : '#d8d2c8'}
				stroke-width={peg.width}
				stroke-linecap="round"
				class={[active && ringing && 'ringing']}
			/>
			<circle cx={peg.x} cy={peg.y} r="9" fill="url(#chrome)" stroke="#6b665e" stroke-width="1" />
		{/each}
	</svg>

	{#each pegs as peg (peg.index)}
		{@const midi = tuner.tunings.selected.strings[peg.index]}
		{@const active = peg.index === tuner.stringIndex}
		{@const tuned = tuner.tuned.has(peg.index)}
		<button
			type="button"
			onclick={() => tuner.pluck(peg.index)}
			aria-label="Play {noteName(midi)}{octave(midi)}"
			aria-pressed={active}
			class={[
				'absolute grid size-[14%] -translate-1/2 place-items-center rounded-full text-xl font-semibold transition',
				tuned ? 'bg-good text-on-good' : 'bg-raised text-fg',
				active && 'ring-3 ring-accent'
			]}
			style:left={peg.left ? '10%' : '90%'}
			style:top="{(peg.y / 400) * 100}%"
		>
			<span>
				{noteName(midi)}<sub class="ml-px text-[0.55em] font-medium opacity-60">{octave(midi)}</sub>
			</span>
			{#if tuned}
				<Check
					class="absolute -top-0.5 -right-0.5 size-5 rounded-full bg-on-good p-0.5 text-good"
					strokeWidth={4}
				/>
			{/if}
		</button>
	{/each}
</div>

<style>
	.ringing {
		animation: ring 70ms linear infinite alternate;
	}

	@keyframes ring {
		to {
			transform: translateX(0.6px);
		}
	}
</style>
