# Tuny

Guitar tuner PWA with built-in and custom tunings.

https://github.com/user-attachments/assets/8d7e494b-8541-4467-8ab4-fe3d1e758eb3

```sh
pnpm install
pnpm dev      # http://localhost:5173
pnpm check    # svelte-check + service worker types
pnpm test     # vitest
pnpm build    # static site in build/
```

Deploy `build/` to any static host over HTTPS (microphone access and service workers need a secure context).
