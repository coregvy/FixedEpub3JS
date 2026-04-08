const CACHE_NAME = 'link-app-v1'; // バージョン管理用
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

// 1. インストール時にファイルをキャッシュに保存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. ネットワークが無くてもキャッシュからファイルを返す
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュにあればそれを返し、なければネットワークから取得
      return response || fetch(event.request);
    })
  );
});