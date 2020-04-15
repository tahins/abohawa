this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('abohawa-static-v1.0').then(function(cache) {
      var base_url = "/projects/abohawa/";
      var precache_urls = [
        base_url,
        base_url + 'bower_components/angular/angular.js',
        base_url + 'bower_components/angular-route/angular-route.js',
        base_url + 'bower_components/angular-touch/angular-touch.js',
        base_url + 'scripts/app.js',
        base_url + 'scripts/controllers/main.js',
        base_url + 'scripts/controllers/settings.js',
        base_url + 'images/favicon.png',
        base_url + 'images/launcher-icon.png',
        base_url + 'images/target.png',
        base_url + 'images/icon-256.png',
        base_url + 'images/icon-192.png',
        base_url + 'images/icon-144.png',
        base_url + 'images/icon-114.png',
        base_url + 'images/icon-96.png',
        base_url + 'images/icon-72.png',
        base_url + 'images/icon-57.png',
        base_url + 'images/abohawa-wallpaper.jpg',
        base_url + 'images/abohawa-wallpaper-night.jpg',
        base_url + 'images/weather-icons/chancerain.png',
        base_url + 'images/weather-icons/chancetstorms.png',
        base_url + 'images/weather-icons/cloudy.png',
        base_url + 'images/weather-icons/cold.png',
        base_url + 'images/weather-icons/flurries.png',
        base_url + 'images/weather-icons/fog.png',
        base_url + 'images/weather-icons/hazy.png',
        base_url + 'images/weather-icons/mostlycloudy.png',
        base_url + 'images/weather-icons/partlysunny.png',
        base_url + 'images/weather-icons/rain.png',
        base_url + 'images/weather-icons/snow.png',
        base_url + 'images/weather-icons/sunny.png',
        base_url + 'images/weather-icons/thunderstorm.png',
        base_url + 'images/weather-icons/tstorms.png',
        base_url + 'images/weather-icons/untitled.png',
        base_url + 'styles/main.css',
        base_url + 'styles/weatherAnimation.css',
        base_url + 'views/main.html',
        base_url + 'views/settings.html',
        'http://fonts.googleapis.com/earlyaccess/lohitbengali.css',
        'http://fonts.gstatic.com/ea/lohitbengali/v6/Lohit-Bengali.woff2'
        ];

      return cache.addAll(precache_urls).then(function () {
        this.skipWaiting();
      });
    })
  );
});

this.addEventListener('activate', function(event) {
  var cacheWhitelist = ['abohawa-static-v1.0'];
  this.clients.claim();

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );

  console.log("Service worker activated.");
});

this.addEventListener('fetch', function(event) {
  console.log(event.request.url);
  
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});