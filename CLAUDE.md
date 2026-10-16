# Tuny

Guitar tuner PWA. SvelteKit (adapter-static) + Svelte 5 runes, Tailwind CSS, pnpm, pitchy for pitch detection, vitest for unit tests.

## Code style

- Focus on clean, minimal code. Don't reinvent the wheel every time and reuse existing patterns when you implement something new.
- Type safety is important. Never use type hacks (`as any`, `as unknown as`, `@ts-ignore`, non-null `!` to silence errors). If something can be done in a way where the compiler can catch an error in the future (or just give autocomplete), vs a way where you have to do things manually, the former is always preferred.
- Only add comments if absolutely necessary, otherwise remove them. Generated scaffold comments can stay.
- Use short, conventional commits, with no body, only the message.
- Use the Svelte MCP / svelte skills for Svelte 5 best practices and run the autofixer on components.

## Notes

- Imports from `src/lib` use the `#lib` subpath alias with an extension: `#lib/notes.js`, `#lib/tuner.svelte.js`, `#lib/components/Meter.svelte`.
- `src/service-worker` has its own tsconfig. `pnpm check` type-checks it separately.
- The app is client-only (`ssr = false`, prerendered shell).

## Visual testing

Playwright MCP is configured in `.mcp.json` with `.playwright/mcp.json`. Chromium gets a fake microphone that loops `.playwright/mic.wav` (an A2 that wobbles up from about 100 cents flat for 5s, then holds in tune for 5s), with mic permission granted and a 390x844 mobile viewport.

- Save screenshots under `.playwright-mcp/` (gitignored). The MCP can't write elsewhere.
- Dev mode serves lucide icons unbundled, so first paint takes about a second. Use `browser_wait_for` with visible text before clicking.
- Chromium only reads `mic.wav` at launch. Call `browser_close` after changing it.
- At large viewports, full-page screenshots can come back blank. Screenshot the `main` element instead.
