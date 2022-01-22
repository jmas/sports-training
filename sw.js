addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    skipWaiting();
  }
});

addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const url = new URL(event.request.url);
      const cacheName = `${url.host}`;

      const cachedResponse = await caches.match(event.request, {
        cacheName,
      });

      if (!navigator.onLine && cachedResponse) {
        return cachedResponse;
      } else if (!navigator.onLine) {
        return new Response(null, { status: 503, statusText: "Offline" });
      }

      const networkResponse = await fetch(event.request);

      if (event.request.method === "GET") {
        // This clone() happens before `return networkResponse`
        const clonedResponse = networkResponse.clone();
        const clonedResponseWithExpire = new Response(networkResponse, {
          headers: {
            ...clonedResponse.headers,
            "x-expire": new Date().getTime() + 12 * 3600 * 1000,
          },
        });

        event.waitUntil(
          (async () => {
            const cache = await caches.open(cacheName);

            // This will be called after `return networkResponse`
            // so make sure you already have the clone!
            await cache.put(event.request, clonedResponseWithExpire);
          })()
        );
      }

      return networkResponse;
    })()
  );
});
