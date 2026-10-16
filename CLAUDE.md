# Tuny

Guitar tuner PWA. SvelteKit (adapter-static) + Svelte 5 runes, Tailwind CSS, pnpm, pitchy for pitch detection, vitest for unit tests.

## Code style

- Focus on clean, minimal code. Don't reinvent the wheel every time and reuse existing patterns when you implement something new.
- Type safety is important. Never use type hacks (`as any`, `as unknown as`, `@ts-ignore`, non-null `!` to silence errors). If something can be done in a way where the compiler can catch an error in the future (or just give autocomplete), vs a way where you have to do things manually, the former is always preferred.
- Use short, conventional commits, with no body, only the message.
- Use the Svelte MCP / svelte skills for Svelte 5 best practices and run the autofixer on components.

## Visual testing

Playwright MCP is configured in `.mcp.json` with `.playwright/mcp.json`. Chromium gets a fake microphone that plays `.playwright/mic.wav` (an A2 tone about 46 cents flat), with mic permission granted and a 390x844 mobile viewport.
