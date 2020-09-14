const CACHE_NAME = "SITE_CONTENT_V1";

const urlList = [
    "./index.html",
    "./404.html",
    "./offline.html",
    "./style/style.css",
    "./js/app.js",
    "./js/config.js",
    "./icons/01d.png",
    "./icons/01n.png",
    "./icons/02d.png",
    "./icons/02n.png",
    "./icons/03d.png",
    "./icons/03n.png",
    "./icons/04d.png",
    "./icons/04n.png",
    "./icons/09d.png",
    "./icons/09n.png",
    "./icons/10d.png",
    "./icons/10n.png",
    "./icons/11d.png",
    "./icons/11n.png",
    "./icons/13d.png",
    "./icons/13n.png",
    "./icons/50d.png",
    "./icons/50n.png",
    "./icons/unknown.png",
    "./icons/android-chrome-192x192.png",
    "./icons/apple-touch-icon.png",
    "./icons/browserconfig.xml",
    "./icons/favicon.ico",
    "./icons/favicon-16x16.png",
    "./icons/favicon-32x32.png",
    "./icons/mstile-150x150.png",
    "./icons/safari-pinned-tab.svg",
    "./icons/site.webmanifest"
];

self.addEventListener("install", function (installer) {
    console.log("Installing service worker...");
    installer.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(urlList);
            })
    );
    self.skipWaiting();
    console.log("Service worker installed successfully");
});

self.addEventListener("fetch", fetchEvent => {

    fetchEvent.respondWith(caches.match(fetchEvent.request)
        .then(res => {
            if (res)
                return res;

            if (!navigator.onLine)
                return caches.match(new Request("./offline.html"));

            try {
                return fetch(fetchEvent.request);
            } catch (e) {
                console.log(e);
            }
        }));
});


self.addEventListener("activate", function (activator) {
    console.log("Activating...");
    const currentCaches = [CACHE_NAME];
    const done = async function () {
        const names = await caches.keys();
        return Promise.all(names.map(function (name) {
            if (!currentCaches.includes(name)) {
                return caches.delete(name);
            };
        }));
    };
    activator.waitUntil(done());
    console.log("Service worker activated successfully");
});