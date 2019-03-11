const CACHE_NAME = "pokemon-v1"
var urlsToCache = [
    "/",
    "/index.html",
    "/detailPokemon.html",
    "/fav-pokemon.html",
    "/css/materialize.min.css",
    "/js/materialize.min.js",
    "/js/api.js",
    "/js/idb.js",
    "/icon.png"
];

self.addEventListener("install", function(event){
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(urlsToCache)
        })
    );
});

self.addEventListener("fetch", function(event){
    event.respondWith(
        caches
            .match(event.request, {cacheName: CACHE_NAME})
            .then(function (response) {
                if(response){
                    console.log("ServiceWorker: Using asset from cache : ", response.url);
                    return response;
                }

                console.log("ServiceWorker: Request asset from server: ", event.request.url);

                return fetch(event.request)
            })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName != CACHE_NAME){
                        console.log("ServiceWorker: cache " + cacheName + " dihapus");
                        return caches.delete(cacheName)
                    }
                })
            );
        })
    );
});