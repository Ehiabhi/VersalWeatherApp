const cacheName = "versalWedaCache";

const urlList = [
    //root
    "/service-workers/index.html",
    "/service-workers/404.html",
    "/service-workers/offline.html",
    "/service-workers/index.sw.js",

    //global
    "/service-workers/style/style.css",
    "/service-workers/js/app.js",
    "/service-workers/js/config.js",
    "/service-workers/icons/01d.png",
    "/service-workers/icons/01n.png",
    "/service-workers/icons/02d.png",
    "/service-workers/icons/02n.png",
    "/service-workers/icons/03d.png",
    "/service-workers/icons/03n.png",
    "/service-workers/icons/04d.png",
    "/service-workers/icons/04n.png",
    "/service-workers/icons/09d.png",
    "/service-workers/icons/09n.png",
    "/service-workers/icons/10d.png",
    "/service-workers/icons/10n.png",
    "/service-workers/icons/11d.png",
    "/service-workers/icons/11n.png",
    "/service-workers/icons/13d.png",
    "/service-workers/icons/13n.png",
    "/service-workers/icons/50d.png",
    "/service-workers/icons/50n.png",
    "/service-workers/icons/unknown.png"
];

self.addEventListener("install", function (installer) {
    console.log("Installing...");

    const done = async function () {
        const cache = await caches.open(cacheName);
        return cache.addAll(urlList);
    };

    installer.waitUntil(done());
});

self.addEventListener("fetch", function (fetchEvent) {
    const url = fetchEvent.request.url;

    console.log(`Fetching: ${url}`);

    const getResponse = async function (request) {
        let response;

        response = await caches.match(request);
        if (response && response.status === 200) {
            console.log("File in cache. Returning cached version.");
            return response;
        }

        try {
            response = await fetch(request);
            if (response && response.status === 400) {
                return caches.match("/service-workers/404.html");
            }
        } catch (e) {
            return caches.match("/service-workers/offline.html");
        }

        const clone = response.clone();
        const cache = await caches.open(cacheName);
        cache.put(url, clone);
        return response;
    };

    fetchEvent.respondWith(getResponse(fetchEvent.request));
});


self.addEventListener("activate", function (activator) {
    console.log("Activating");

    const currentCaches = [cacheName];
    const done = async function () {
        const names = await caches.keys();
        return Promise.all(names.map(function (name) {
            if (!currentCaches.includes(name)) {
                return caches.delete(name);
            };
        }));
    };

    activator.waitUntil(done());
});