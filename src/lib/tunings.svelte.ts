import * as v from 'valibot';
import { persisted } from './persisted';
import { BUILT_IN_TUNINGS, DEFAULT_TUNING, TuningSchema, type Tuning } from './tunings';

export class TuningStore {
	#custom = persisted('tuny:custom-tunings', v.array(TuningSchema), []);
	#selectedId = persisted('tuny:selected-tuning', v.string(), DEFAULT_TUNING.id);

	readonly builtIn = BUILT_IN_TUNINGS;
	custom = $derived(this.#custom.current);
	all = $derived([...this.builtIn, ...this.custom]);
	selected = $derived(this.all.find((t) => t.id === this.#selectedId.current) ?? DEFAULT_TUNING);

	select(id: string) {
		this.#selectedId.current = id;
	}

	isCustom(id: string): boolean {
		return this.custom.some((t) => t.id === id);
	}

	save(tuning: Tuning) {
		const index = this.custom.findIndex((t) => t.id === tuning.id);
		this.#custom.current =
			index === -1 ? [...this.custom, tuning] : this.custom.with(index, tuning);
		this.select(tuning.id);
	}

	remove(id: string) {
		this.#custom.current = this.custom.filter((t) => t.id !== id);
		if (this.#selectedId.current === id) this.select(DEFAULT_TUNING.id);
	}
}
