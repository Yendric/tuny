import { describe, expect, it } from 'vitest';
import { cents, frequency, median, nearestIndex, noteName, octave, toMidi } from './notes';
import { BUILT_IN_TUNINGS } from './tunings';

describe('notes', () => {
	it('names midi notes', () => {
		expect([40, 45, 50, 55, 59, 64].map((m) => `${noteName(m)}${octave(m)}`)).toEqual([
			'E2',
			'A2',
			'D3',
			'G3',
			'B3',
			'E4'
		]);
		expect(noteName(39)).toBe('Eb');
	});

	it('round-trips name and octave to midi', () => {
		for (let midi = 24; midi < 96; midi++) {
			expect(toMidi(noteName(midi), octave(midi))).toBe(midi);
		}
	});

	it('computes frequencies against a reference A4', () => {
		expect(frequency(69, 440)).toBe(440);
		expect(frequency(40, 440)).toBeCloseTo(82.41, 2);
		expect(frequency(69, 430)).toBe(430);
		expect(frequency(57, 430)).toBe(215);
	});

	it('computes cents offset', () => {
		expect(cents(440, 440)).toBe(0);
		expect(cents(880, 440)).toBe(1200);
		expect(cents(frequency(70, 440), 440)).toBeCloseTo(100);
		expect(cents(107, 110)).toBeCloseTo(-47.9, 1);
	});

	it('finds the nearest string', () => {
		const targets = BUILT_IN_TUNINGS[0].strings.map((m) => frequency(m, 440));
		expect(nearestIndex(107, targets)).toBe(1);
		expect(nearestIndex(80, targets)).toBe(0);
		expect(nearestIndex(340, targets)).toBe(5);
	});

	it('takes the median', () => {
		expect(median([3, 1, 2])).toBe(2);
		expect(median([4, 1, 3, 2])).toBe(2.5);
	});
});
