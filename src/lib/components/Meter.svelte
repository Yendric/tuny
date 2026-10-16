<script lang="ts">
	import { Check } from '@lucide/svelte';
	import type { Attachment } from 'svelte/attachments';
	import { IN_TUNE_CENTS, TRAIL_MS, type Tuner } from '#lib/tuner.svelte.js';

	let { tuner }: { tuner: Tuner } = $props();

	const RANGE_CENTS = 50;
	const SPREAD = 0.42;
	const BUBBLE_Y = 44;
	const GRID = 28;
	const JUMP_CENTS = 30;

	const offset = (cents: number) => Math.max(-1, Math.min(1, cents / RANGE_CENTS));

	let position = $derived(tuner.cents === null ? 0 : offset(tuner.cents));
	let label = $derived.by(() => {
		if (tuner.cents === null) return '';
		const rounded = Math.max(-99, Math.min(99, Math.round(tuner.cents)));
		return rounded > 0 ? `+${rounded}` : `${rounded}`;
	});
	let hint = $derived.by(() => {
		if (tuner.cents === null) return tuner.auto ? 'Play a string' : 'Play the highlighted string';
		if (tuner.inTune) return 'In tune';
		return tuner.cents < 0 ? 'Tune up' : 'Tune down';
	});

	const trail: Attachment<HTMLCanvasElement> = (canvas) => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const style = getComputedStyle(canvas);
		let frame = 0;

		const render = () => {
			const { clientWidth: w, clientHeight: h } = canvas;
			const ratio = devicePixelRatio;
			if (canvas.width !== w * ratio || canvas.height !== h * ratio) {
				canvas.width = w * ratio;
				canvas.height = h * ratio;
			}
			ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
			ctx.clearRect(0, 0, w, h);

			const now = performance.now();
			const xOf = (cents: number) => w / 2 + offset(cents) * w * SPREAD;
			const yOf = (time: number) => BUBBLE_Y + ((now - time) / TRAIL_MS) * (h - BUBBLE_Y);

			ctx.lineWidth = 1;
			ctx.strokeStyle = style.getPropertyValue('--line');
			ctx.beginPath();
			for (let c = -RANGE_CENTS; c <= RANGE_CENTS; c += 10) {
				ctx.moveTo(xOf(c), 0);
				ctx.lineTo(xOf(c), h);
			}
			for (let y = ((now / TRAIL_MS) * h) % GRID; y < h; y += GRID) {
				ctx.moveTo(0, y);
				ctx.lineTo(w, y);
			}
			ctx.stroke();

			ctx.fillStyle = style.getPropertyValue('--good');
			ctx.globalAlpha = 0.1;
			ctx.fillRect(xOf(-IN_TUNE_CENTS), 0, xOf(IN_TUNE_CENTS) - xOf(-IN_TUNE_CENTS), h);
			ctx.globalAlpha = 1;

			ctx.lineWidth = 4;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			const points = tuner.trail;
			for (let i = 1; i < points.length; i++) {
				const [a, b] = [points[i - 1], points[i]];
				if (a.cents === null || b.cents === null || Math.abs(a.cents - b.cents) > JUMP_CENTS)
					continue;
				const y = yOf(b.time);
				ctx.globalAlpha = Math.max(0, 1 - (y - BUBBLE_Y) / (h - BUBBLE_Y));
				ctx.strokeStyle = style.getPropertyValue(
					Math.abs(b.cents) <= IN_TUNE_CENTS ? '--good' : '--accent'
				);
				ctx.beginPath();
				ctx.moveTo(xOf(a.cents), yOf(a.time));
				ctx.lineTo(xOf(b.cents), y);
				ctx.stroke();
			}
			ctx.globalAlpha = 1;
			frame = requestAnimationFrame(render);
		};
		frame = requestAnimationFrame(render);

		return () => cancelAnimationFrame(frame);
	};
</script>

<div class="relative size-full overflow-hidden">
	<canvas {@attach trail} class="absolute inset-0 size-full"></canvas>
	<div
		class="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent from-60% to-bg"
	></div>

	<div class="absolute top-0 left-1/2 h-full w-px bg-line"></div>

	<div
		class={[
			'absolute grid size-14 -translate-1/2 place-items-center rounded-full border-3 text-lg font-bold tabular-nums transition-[left,background-color,border-color] duration-100',
			tuner.cents === null && 'border-muted bg-bg',
			tuner.cents !== null && !tuner.inTune && 'border-accent bg-accent text-on-accent',
			tuner.inTune && 'border-good bg-good text-on-good'
		]}
		style:left="{50 + position * SPREAD * 100}%"
		style:top="{BUBBLE_Y}px"
		role="meter"
		aria-label="Cents off pitch"
		aria-valuemin={-RANGE_CENTS}
		aria-valuemax={RANGE_CENTS}
		aria-valuenow={tuner.cents === null ? undefined : Math.round(tuner.cents)}
	>
		{#if tuner.inTune}
			<Check strokeWidth={3.5} />
		{:else}
			{label}
		{/if}
	</div>

	<div class="absolute inset-x-0 bottom-3 flex items-baseline justify-between px-5">
		<span
			class={[
				'text-3xl font-semibold transition-colors',
				position < 0 && !tuner.inTune ? 'text-accent' : 'text-muted/40'
			]}>♭</span
		>
		<p
			class={['text-lg font-medium', tuner.inTune ? 'text-good' : 'text-muted']}
			aria-live="polite"
		>
			{hint}
		</p>
		<span
			class={[
				'text-3xl font-semibold transition-colors',
				position > 0 && !tuner.inTune ? 'text-accent' : 'text-muted/40'
			]}>♯</span
		>
	</div>
</div>
