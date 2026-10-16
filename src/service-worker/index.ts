import { self } from '$app/service-worker';
import { version } from '$app/env';
import { assets, immutable } from '$app/manifest';
import { resolve } from '$app/paths';

const CACHE = `cache-${version}`;

const HOME = resolve('/');
const ASSETS = new Set([...immutable, ...assets].map((file) => `${HOME}${file.path}`));

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...ASSETS, HOME])));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
			)
	);
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		if (ASSETS.has(url.pathname)) {
			const cached = await cache.match(url.pathname);
			if (cached) return cached;
		}

		try {
			const response = await fetch(event.request);
			if (response.status === 200 && url.origin === self.location.origin) {
				void cache.put(event.request, response.clone());
			}
			return response;
		} catch (error) {
			const cached = await cache.match(event.request);
			if (cached) return cached;
			throw error;
		}
	}

	event.respondWith(respond());
});
