import { cents, median } from '../notes';

const ATTACK_MS = 200;
const WINDOW_MS = 150;
const MIN_READINGS = 3;
const DROPOUT_MS = 250;
export const JUMP_CENTS = 50;
const CONFIRM_MS = 400;
const ONSET_RATIO = 2;
const ENVELOPE_DECAY = 0.95;
const FADED_RATIO = 0.1;

export type Frame = { hz: number | null; rms: number; time: number };

export class PitchTracker {
	#readings: { hz: number; time: number }[] = [];
	#stable: number | null = null;
	#fresh = true;
	#jumpSince: number | null = null;
	#attackUntil = -Infinity;
	#lastHeard = -Infinity;
	#envelope = 0;
	#peak = 0;

	push({ hz, rms, time }: Frame): number | null {
		if (rms > this.#envelope * ONSET_RATIO) {
			this.#attackUntil = time + ATTACK_MS;
			this.#readings = [];
			this.#fresh = true;
			this.#peak = 0;
		}
		this.#envelope = Math.max(rms, this.#envelope * ENVELOPE_DECAY);
		if (time < this.#attackUntil) {
			this.#peak = Math.max(this.#peak, rms);
			return this.#stable;
		}

		if (hz === null || rms < this.#peak * FADED_RATIO) {
			if (time - this.#lastHeard > DROPOUT_MS) this.reset();
			return this.#stable;
		}
		this.#lastHeard = time;
		this.#readings = [...this.#readings.filter((r) => r.time > time - WINDOW_MS), { hz, time }];
		if (this.#readings.length < MIN_READINGS) return this.#stable;

		const candidate = median(this.#readings.map((r) => r.hz));
		if (
			this.#stable === null ||
			this.#fresh ||
			Math.abs(cents(candidate, this.#stable)) < JUMP_CENTS
		) {
			this.#accept(candidate);
		} else {
			this.#jumpSince ??= time;
			if (time - this.#jumpSince >= CONFIRM_MS) this.#accept(candidate);
		}
		return this.#stable;
	}

	reset() {
		this.#readings = [];
		this.#stable = null;
		this.#fresh = true;
		this.#jumpSince = null;
	}

	#accept(hz: number) {
		this.#stable = hz;
		this.#fresh = false;
		this.#jumpSince = null;
	}
}
