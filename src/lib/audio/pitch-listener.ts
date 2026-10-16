import { PitchDetector } from 'pitchy';
import type { Frame } from './pitch-tracker';

const MIN_CLARITY = 0.9;
const MIN_HZ = 50;
const MAX_HZ = 1400;

export class PitchListener {
	#context: AudioContext | undefined;
	#stream: MediaStream | undefined;
	#frame = 0;

	async start(onFrame: (frame: Frame) => void) {
		this.#stream = await navigator.mediaDevices.getUserMedia({
			audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
		});
		const context = (this.#context = new AudioContext());
		const analyser = new AnalyserNode(context, { fftSize: 4096 });
		context.createMediaStreamSource(this.#stream).connect(analyser);

		const detector = PitchDetector.forFloat32Array(analyser.fftSize);
		detector.minVolumeDecibels = -50;
		const buffer = new Float32Array(analyser.fftSize);

		const tick = () => {
			analyser.getFloatTimeDomainData(buffer);
			const [hz, clarity] = detector.findPitch(buffer, context.sampleRate);
			onFrame({
				hz: clarity >= MIN_CLARITY && hz >= MIN_HZ && hz <= MAX_HZ ? hz : null,
				rms: Math.sqrt(buffer.reduce((sum, x) => sum + x * x, 0) / buffer.length),
				time: performance.now()
			});
			this.#frame = requestAnimationFrame(tick);
		};
		tick();
	}

	resume() {
		return this.#context?.resume();
	}

	stop() {
		cancelAnimationFrame(this.#frame);
		this.#stream?.getTracks().forEach((track) => track.stop());
		void this.#context?.close();
		this.#context = this.#stream = undefined;
	}
}
