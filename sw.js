const CACHE_VERSION='iqra92-shell-v1';
const AUDIO_CACHE='iqra92-quran-audio-v1';
const CORE=['./','./index.html','./manifest.json','./digital-khatt-indopak.otf'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_VERSION);
    for(const path of CORE){try{await cache.add(new Request(new URL(path,self.registration.scope),{cache:'reload'}));}catch(e){}}
    self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('iqra92-shell-')&&key!==CACHE_VERSION).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response.ok){const cache=await caches.open(CACHE_VERSION);cache.put(new URL('./index.html',self.registration.scope),response.clone());}
        return response;
      }catch(e){
        return (await caches.match(request))||(await caches.match(new URL('./index.html',self.registration.scope)))||Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(request);
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response.ok&&['style','script','font','image'].includes(request.destination)){
        const cache=await caches.open(CACHE_VERSION);cache.put(request,response.clone());
      }
      return response;
    }catch(e){return Response.error();}
  })());
});
