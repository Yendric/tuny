import { describe, expect, it } from 'vitest';
import { PitchTracker } from './pitch-tracker';

const FRAME_MS = 16;

function play(tracker: PitchTracker, from: number, readings: (number | null)[], rms = 0.1) {
	return readings.map((hz, i) => tracker.push({ hz, rms, time: from + i * FRAME_MS }));
}

function sustain(tracker: PitchTracker, from: number, hz: number | null, ms: number, rms = 0.1) {
	return play(tracker, from, Array<number | null>(Math.round(ms / FRAME_MS)).fill(hz), rms);
}

describe('PitchTracker', () => {
	it('hides the attack of a pluck', () => {
		const tracker = new PitchTracker();
		const attack = play(tracker, 0, [300, 55, 220, 160, 41, 118, 112, 111, 111, 110, 110, 110]);
		expect(attack.every((hz) => hz === null)).toBe(true);
		expect(sustain(tracker, 192, 110, 100).at(-1)).toBe(110);
	});

	it('ignores brief octave and subharmonic glitches', () => {
		const tracker = new PitchTracker();
		sustain(tracker, 0, 110, 400);
		const glitch = sustain(tracker, 400, 65, 300);
		expect(glitch.every((hz) => hz === 110)).toBe(true);
	});

	it('follows a sustained new pitch after confirming it', () => {
		const tracker = new PitchTracker();
		sustain(tracker, 0, 110, 400);
		const changed = sustain(tracker, 400, 147, 700);
		expect(changed[20]).toBe(110);
		expect(changed.at(-1)).toBe(147);
	});

	it('follows small pitch changes immediately', () => {
		const tracker = new PitchTracker();
		sustain(tracker, 0, 110, 400);
		expect(sustain(tracker, 400, 111, 100).at(-1)).toBe(111);
	});

	it('bridges short dropouts and resets after silence', () => {
		const tracker = new PitchTracker();
		sustain(tracker, 0, 110, 400);
		expect(sustain(tracker, 400, null, 150).at(-1)).toBe(110);
		expect(sustain(tracker, 550, null, 300).at(-1)).toBeNull();
	});

	it('shows a new pluck of another string without waiting for confirmation', () => {
		const tracker = new PitchTracker();
		sustain(tracker, 0, 110, 400, 0.05);
		const replucked = sustain(tracker, 400, 147, 400, 0.3);
		const firstShown = replucked.findIndex((hz) => hz === 147);
		expect(firstShown * FRAME_MS).toBeLessThan(300);
	});

	it('stops showing a note once it has faded', () => {
		const tracker = new PitchTracker();
		sustain(tracker, 0, 110, 400, 0.1);
		expect(sustain(tracker, 400, 110, 100, 0.02).at(-1)).toBe(110);
		expect(sustain(tracker, 500, 110, 400, 0.005).at(-1)).toBeNull();
	});
});
