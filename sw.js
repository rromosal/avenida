const CACHE_NAME = "bcmeinsavenida-v2";
const URLS_TO_CACHE = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(
        nombres
          .filter(function (n) { return n !== CACHE_NAME; })
          .map(function (n) { return caches.delete(n); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

// Sirve siempre desde la caché (funciona sin conexión). Si hay conexión,
// refresca la caché en segundo plano para la próxima apertura.
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (cached) {
      const enRed = fetch(event.request)
        .then(function (respuesta) {
          if (respuesta && respuesta.ok) {
            const copia = respuesta.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, copia);
            });
          }
          return respuesta;
        })
        .catch(function () { return cached; });

      return cached || enRed;
    })
  );
});
