export const NOTE_NAMES = [
	'C',
	'Db',
	'D',
	'Eb',
	'E',
	'F',
	'Gb',
	'G',
	'Ab',
	'A',
	'Bb',
	'B'
] as const;
export type NoteName = (typeof NOTE_NAMES)[number];

export type Midi = number;

const A4_MIDI = 69;

export function noteName(midi: Midi): NoteName {
	return NOTE_NAMES[((midi % 12) + 12) % 12];
}

export function octave(midi: Midi): number {
	return Math.floor(midi / 12) - 1;
}

export function toMidi(name: NoteName, octave: number): Midi {
	return (octave + 1) * 12 + NOTE_NAMES.indexOf(name);
}

export function frequency(midi: Midi, a4: number): number {
	return a4 * 2 ** ((midi - A4_MIDI) / 12);
}

export function cents(freq: number, target: number): number {
	return 1200 * Math.log2(freq / target);
}

export function nearestIndex(freq: number, targets: readonly number[]): number {
	let best = 0;
	targets.forEach((target, i) => {
		if (Math.abs(cents(freq, target)) < Math.abs(cents(freq, targets[best]))) best = i;
	});
	return best;
}

export function median(values: readonly number[]): number {
	const sorted = values.toSorted((a, b) => a - b);
	const mid = sorted.length >> 1;
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
