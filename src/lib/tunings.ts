import * as v from 'valibot';

const StringsSchema = v.tuple([
	v.number(),
	v.number(),
	v.number(),
	v.number(),
	v.number(),
	v.number()
]);

export const TuningSchema = v.object({
	id: v.string(),
	name: v.string(),
	a4: v.number(),
	// midi notes, low 6th string first
	strings: StringsSchema
});

export type Tuning = v.InferOutput<typeof TuningSchema>;
export type Strings = Tuning['strings'];

export const MIN_A4 = 400;
export const MAX_A4 = 480;

export const BUILT_IN_TUNINGS: readonly Tuning[] = [
	{ id: 'standard', name: 'Standard', a4: 440, strings: [40, 45, 50, 55, 59, 64] },
	{ id: 'drop-d', name: 'Drop D', a4: 440, strings: [38, 45, 50, 55, 59, 64] },
	{ id: 'half-step-down', name: 'Half step down', a4: 440, strings: [39, 44, 49, 54, 58, 63] },
	{ id: 'a430', name: '430 Hz (early AC/DC)', a4: 430, strings: [40, 45, 50, 55, 59, 64] },
	{ id: 'full-step-down', name: 'Full step down', a4: 440, strings: [38, 43, 48, 53, 57, 62] },
	{ id: 'dadgad', name: 'DADGAD', a4: 440, strings: [38, 45, 50, 55, 57, 62] },
	{ id: 'open-g', name: 'Open G', a4: 440, strings: [38, 43, 50, 55, 59, 62] }
];

export const DEFAULT_TUNING = BUILT_IN_TUNINGS[0];
