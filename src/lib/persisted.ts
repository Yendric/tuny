import { PersistedState } from 'runed';
import * as v from 'valibot';

export function persisted<S extends v.GenericSchema>(
	key: string,
	schema: S,
	initial: v.InferOutput<S>
): PersistedState<v.InferOutput<S>> {
	const safe = v.fallback(schema, initial);
	return new PersistedState(key, initial, {
		serializer: {
			serialize: JSON.stringify,
			deserialize: (raw) => {
				try {
					return v.parse(safe, JSON.parse(raw));
				} catch {
					return initial;
				}
			}
		}
	});
}
