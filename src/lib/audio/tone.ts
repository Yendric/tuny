const DURATION = 2.5;

let context: AudioContext | undefined;

export function playTone(hz: number): Promise<void> {
	context ??= new AudioContext();
	const now = context.currentTime;

	const gain = new GainNode(context, { gain: 0 });
	gain.gain.linearRampToValueAtTime(0.35, now + 0.01);
	gain.gain.exponentialRampToValueAtTime(0.0001, now + DURATION);

	const filter = new BiquadFilterNode(context, { type: 'lowpass', frequency: hz * 6 });
	filter.connect(gain).connect(context.destination);

	const oscillator = new OscillatorNode(context, { type: 'sawtooth', frequency: hz });
	oscillator.connect(filter);
	oscillator.start(now);
	oscillator.stop(now + DURATION);

	return new Promise((resolve) => (oscillator.onended = () => resolve()));
}
