const CACHE_NAME='passphrase-v1';
const urlsToCache=['/','/wordlist.js','/app.js','/about','/why'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urlsToCache)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(n=>Promise.all(n.map(n=>n!==CACHE_NAME?caches.delete(n):null))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>{if(r)return r;const f=e.request.clone();return fetch(f).then(r=>{if(!r||r.status!==200||r.type!=='basic')return r;const c=r.clone();caches.open(CACHE_NAME).then(a=>a.put(e.request,c));return r})}))});