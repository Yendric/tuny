# Tuny

Guitar tuner PWA with built-in and custom tunings.

```sh
pnpm install
pnpm dev      # http://localhost:5173
pnpm check    # svelte-check + service worker types
pnpm test     # vitest
pnpm build    # static site in build/
```

Deploy `build/` to any static host over HTTPS (microphone access and service workers need a secure context).
