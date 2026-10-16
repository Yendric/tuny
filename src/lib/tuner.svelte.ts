import * as v from 'valibot';
import { SvelteSet } from 'svelte/reactivity';
import { PitchListener } from './audio/pitch-listener';
import { playTone } from './audio/tone';
import { cents, frequency, median, nearestIndex } from './notes';
import { persisted } from './persisted';
import { TuningStore } from './tunings.svelte';

export const IN_TUNE_CENTS = 5;
const HOLD_MS = 1000;
export const TRAIL_MS = 5000;
const SMOOTHING_FRAMES = 5;
const SILENCE_FRAMES = 12;

export type Status = 'idle' | 'starting' | 'listening' | 'denied' | 'error';
export type TrailPoint = { time: number; cents: number | null };

export class Tuner {
	status = $state<Status>('idle');
	frequency = $state<number | null>(null);
	readonly trail: TrailPoint[] = [];

	readonly tunings = new TuningStore();
	#auto = persisted('tuny:auto', v.boolean(), true);
	#listener = new PitchListener();
	#wakeLock: WakeLockSentinel | undefined;
	#recent: number[] = [];
	#silentFrames = 0;
	#inTuneSince: number | null = null;
	#tonesPlaying = 0;

	targets = $derived(
		this.tunings.selected.strings.map((midi) => frequency(midi, this.tunings.selected.a4))
	);
	stringIndex = $derived.by(() => {
		void this.tunings.selected;
		return 0;
	});
	tuned = $derived.by(() => {
		void this.tunings.selected;
		return new SvelteSet<number>();
	});
	cents = $derived(
		this.frequency === null ? null : cents(this.frequency, this.targets[this.stringIndex])
	);
	inTune = $derived(this.cents !== null && Math.abs(this.cents) <= IN_TUNE_CENTS);

	get auto() {
		return this.#auto.current;
	}

	set auto(value: boolean) {
		this.#auto.current = value;
	}

	async start() {
		this.status = 'starting';
		try {
			await this.#listener.start(this.#onPitch);
			this.status = 'listening';
			await this.#lockScreen();
		} catch (error) {
			this.status =
				error instanceof DOMException && error.name === 'NotAllowedError' ? 'denied' : 'error';
		}
	}

	async resume() {
		if (this.status !== 'listening') return;
		await this.#listener.resume();
		await this.#lockScreen();
	}

	stop() {
		this.#listener.stop();
		void this.#wakeLock?.release();
		this.status = 'idle';
		this.frequency = null;
	}

	async pluck(index: number) {
		this.auto = false;
		this.stringIndex = index;
		this.#tonesPlaying++;
		try {
			await playTone(this.targets[index]);
		} finally {
			this.#tonesPlaying--;
		}
	}

	reset() {
		this.tuned.clear();
		this.stringIndex = 0;
	}

	#onPitch = (hz: number | null) => {
		this.#smooth(this.#tonesPlaying > 0 ? null : hz);
		if (this.auto && this.frequency !== null) {
			this.stringIndex = nearestIndex(this.frequency, this.targets);
		}
		this.#trackInTune();
		this.#record();
	};

	#smooth(hz: number | null) {
		if (hz === null) {
			if (++this.#silentFrames < SILENCE_FRAMES) return;
			this.#recent = [];
			this.frequency = null;
			return;
		}
		this.#silentFrames = 0;
		this.#recent = [...this.#recent, hz].slice(-SMOOTHING_FRAMES);
		this.frequency = median(this.#recent);
	}

	#trackInTune() {
		const now = performance.now();
		if (!this.inTune) {
			this.#inTuneSince = null;
			return;
		}
		this.#inTuneSince ??= now;
		if (now - this.#inTuneSince < HOLD_MS || this.tuned.has(this.stringIndex)) return;

		this.tuned.add(this.stringIndex);
		const next = this.targets.findIndex((_, i) => !this.tuned.has(i));
		if (!this.auto && next !== -1) this.stringIndex = next;
	}

	#record() {
		const now = performance.now();
		this.trail.push({ time: now, cents: this.cents });
		while (this.trail[0].time < now - TRAIL_MS) this.trail.shift();
	}

	async #lockScreen() {
		if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
		try {
			this.#wakeLock = await navigator.wakeLock.request('screen');
		} catch {
			this.#wakeLock = undefined;
		}
	}
}
