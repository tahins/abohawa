'use strict';

/**
 * @ngdoc function
 * @name abohawaApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the abohawaApp
 */
angular.module('abohawaApp')
  .controller('MainCtrl', function ($scope, $route, $rootScope, $http) {
  	$rootScope.current_temp = "-";
    $rootScope.current_cond = "---";
    $rootScope.current_location = "-----";
    $rootScope.current_location_element = document.querySelector(".current-location");
    $rootScope.current_color = "424242";
    $rootScope.current_icon = "undefined";
    $rootScope.current_bg_url = "images/abohawa-wallpaper.jpg";
    $rootScope.current_tod = "day";
    $rootScope.api_key = "3e00ee3cdf8e40b757ebe9e6a03f8f9d";

    $rootScope.viaLatLong = true;

    var current_hours = new Date().getHours();
    if (current_hours >= 18 || current_hours < 6) { $rootScope.current_bg_url = "images/abohawa-wallpaper-night.jpg"; $rootScope.current_tod = "night"; }

    $rootScope.today_temp_high = "-";
    $rootScope.today_temp_low = "-";

    $rootScope.tomorrow_temp_high = "-";
    $rootScope.tomorrow_temp_low = "-";
    $rootScope.tomorrow_icon = "undefined";

    $rootScope.porshu_temp_high = "-";
    $rootScope.porshu_temp_low = "-";
    $rootScope.porshu_icon = "undefined";

    $rootScope.on_location_update = function (event) {
      if (event.keyCode == 13) {
        // enter pressed
        console.log($rootScope.current_location_element.value);

        $rootScope.viaLatLong = false;
        onGetLocationSuccess({
          'city' : $rootScope.current_location_element.value,
          'countryCode': ''
        });
      }
    };


    $rootScope.reset_current_location = function () {
      $rootScope.viaLatLong = true;
      getLocation(onGetLocationSuccess, function () {});
    }

    function onGetLocationSuccess (data) {
      var arg1, arg2;
      if ($rootScope.viaLatLong) {
        arg1 = data.coords.latitude;
        arg2 = data.coords.longitude;
      } else {
        arg1 = data.city;
        arg2 = data.countryCode;
      }

      console.log(arg1 + ", " + arg2);

      // get location success
      getCurrent(arg1, arg2, function(temp_c, code){
        // get current success
        $rootScope.current_temp = number_banglafy(temp_c);
        var condObj = condition_banglafy(parseInt(code));
        $rootScope.current_cond = condObj["banglaCondition"];
        $rootScope.current_color = condObj["conditionColor"];
        $rootScope.current_icon = condObj["conditionIcon"];
        $rootScope.current_animation = condObj["conditionAnimation"];
      }, function(){});

      getForecast(arg1, arg2, function(high0, low0, code0, high1, low1, code1, high2, low2, code2){
        // get forcast success
        $rootScope.today_temp_high = number_banglafy(high0);
        $rootScope.today_temp_low = number_banglafy(low0);
        var condObj = condition_banglafy(parseInt(code0));
        $rootScope.today_icon = condObj["conditionIcon"];

        $rootScope.tomorrow_temp_high = number_banglafy(high1);
        $rootScope.tomorrow_temp_low = number_banglafy(low1);
        var condObj = condition_banglafy(parseInt(code1));
        $rootScope.tomorrow_icon = condObj["conditionIcon"];

        $rootScope.porshu_temp_high = number_banglafy(high2);
        $rootScope.porshu_temp_low = number_banglafy(low2);
        var condObj = condition_banglafy(parseInt(code2));
        $rootScope.porshu_icon = condObj["conditionIcon"];
      }, function(){});

      getLocationInBengali(arg1, arg2, function(formatted_address){
        $rootScope.current_location = formatted_address;
        $rootScope.current_location_element.value = "";
      }, function(){});
    }

    function getGeolocation (success, error) {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(success, error);
      } else { 
          error();
      }
    }

    function getLocation (success, error) {
      getGeolocation(success, function () {
        $rootScope.viaLatLong = false;

        $http.get('http://ip-api.com/json').
          success(function(data) {
            // console.log(data);
            success(data);

          }).error(function(data, status, headers, config) { error(); });

        error();
      });      
    }

    function getLocationInBengali (arg1, arg2, success, error) {
      // Current location name in Bengali
      $http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+arg1+',+'+arg2+'&language=bn').
          success(function(data, status, headers, config) {
            // console.log(data);
            var bn_location_name = "";
            for (var i = 0; i < data.results.length; ++i) {
              bn_location_name = data.results[i].formatted_address;
              if (bn_location_name.match(/[a-z]/i) == null) break;
            }
            localStorage.setItem("location_bn", bn_location_name);
            success(localStorage.getItem("location_bn"));

          }).error(function(data, status, headers, config) { error(); });
    }

    function getCurrent (arg1, arg2, success, error) {
      // Current Weather
      var current_weather_url;
      if ($rootScope.viaLatLong) current_weather_url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + arg1 + '&lon=' + arg2 + '&units=metric&APPID=' + $rootScope.api_key;
      else current_weather_url = 'https://api.openweathermap.org/data/2.5/weather?q=' + arg1 + ', ' + arg2 + '&units=metric&APPID=' + $rootScope.api_key;

      $http.get(current_weather_url).success(function(data) {
        console.log("now: " + data.weather[0].description + " (" + data.weather[0].id + ")");
        success(
          parseInt(data.main.temp),
          data.weather[0].id
        );

      }).error(function(data, status, headers, config) { error(); });
    }

    function getForecast (arg1, arg2, success, error) {
      // Future forecast
      // https://api.openweathermap.org/data/2.5/weather?q=Dhaka,BD&units=metric
      // https://api.openweathermap.org/data/2.5/forecast?q=Dhaka,BD&units=metric
      var daily_weather_url;
      if ($rootScope.viaLatLong) daily_weather_url = 'https://api.openweathermap.org/data/2.5/forecast/daily?lat=' + arg1 + '&lon=' + arg2 + '&units=metric&APPID=' + $rootScope.api_key;
      else daily_weather_url = 'https://api.openweathermap.org/data/2.5/forecast/daily?q=' + arg1 + ', ' + arg2 + '&units=metric&APPID=' + $rootScope.api_key;

      $http.get(daily_weather_url).success(function(data) {
        // console.log(data);
        console.log("today: " + data.list[0].weather[0].description + " (" + data.list[0].weather[0].id + ")");
        console.log("tomorrow: " + data.list[1].weather[0].description + " (" + data.list[1].weather[0].id + ")");
        console.log("porshu: " + data.list[2].weather[0].description + " (" + data.list[1].weather[0].id + ")");
        success(
          parseInt(data.list[0].temp.max),
          parseInt(data.list[0].temp.min),
          data.list[0].weather[0].id,
          parseInt(data.list[1].temp.max),
          parseInt(data.list[1].temp.min),
          data.list[1].weather[0].id,
          parseInt(data.list[2].temp.max),
          parseInt(data.list[2].temp.min),
          data.list[2].weather[0].id
        );

      }).error(function(data, status, headers, config) { error(); });
    }



    function number_banglafy (number) {
      return (""+number).replace(/0/g, "০").replace(/1/g, "১").replace(/2/g, "২").replace(/3/g, "৩")
        .replace(/4/g, "৪").replace(/5/g, "৫").replace(/6/g, "৬").replace(/7/g, "৭").replace(/8/g, "৮").replace(/9/g, "৯");
    }

    function condition_banglafy (condition_code) {
      // condition code list - https://developer.yahoo.com/weather/documentation.html
      // console.log(condition_code);
      var conditionObj = {
        "banglaCondition" : "",
        "conditionColor" : "",
        "conditionIcon" : ""
      };

      switch(condition_code) {
        case 800:
        case 951:
            conditionObj["banglaCondition"] = "পরিষ্কার";
            conditionObj["conditionColor"] = "1565C0";
            conditionObj["conditionIcon"] = "sunny";
            if ($rootScope.current_tod == "day") conditionObj["conditionAnimation"] = "sunny";
            else conditionObj["conditionAnimation"] = "starry";
            break;
        // case "partlycloudy":
        case 801:
        case 802:
          conditionObj["banglaCondition"] = "আংশিক মেঘাচ্ছন্ন";
          conditionObj["conditionColor"] = "424242";
          conditionObj["conditionIcon"] = "cloudy";
          conditionObj["conditionAnimation"] = "cloudy";
          break;
        // case "mostlycloudy":
        case 803:
        case 804:
          conditionObj["banglaCondition"] = "মেঘাচ্ছন্ন";
          conditionObj["conditionColor"] = "424242";
          conditionObj["conditionIcon"] = "mostlycloudy";
          conditionObj["conditionAnimation"] = "cloudy";
          break;
        // case "cloudy":
        case 781:
          conditionObj["banglaCondition"] = "মেঘাচ্ছন্ন";
          conditionObj["conditionColor"] = "424242";
          conditionObj["conditionIcon"] = "cloudy";
          conditionObj["conditionAnimation"] = "cloudy";
          break;
        // case "hazy":
        case 701:
        case 711:
        case 721:
        case 731:
        case 751:
        case 761:
        case 762:
        case 771:
          conditionObj["banglaCondition"] = "আবছা";
          conditionObj["conditionColor"] = "37474F";
          conditionObj["conditionIcon"] = "hazy";
          conditionObj["conditionAnimation"] = "cloudy";
          break;
        // case "fog":
        case 741:
          conditionObj["banglaCondition"] = "কুয়াশাচ্ছন্ন";
          conditionObj["conditionColor"] = "37474F";
          conditionObj["conditionIcon"] = "fog";
          conditionObj["conditionAnimation"] = "cloudy";
          break;
        // case "mostlysunny":
        case 904:
          conditionObj["banglaCondition"] = "রৌদ্রজ্জল";
          conditionObj["conditionColor"] = "EF6C00";
          conditionObj["conditionIcon"] = "sunny";
          conditionObj["conditionAnimation"] = "sunny";
          break;
        // case "partlysunny":
        case 904:
          conditionObj["banglaCondition"] = "আংশিক রৌদ্রজ্জল";
          conditionObj["conditionColor"] = "0277BD";
          conditionObj["conditionIcon"] = "partlysunny";
          conditionObj["conditionAnimation"] = "sunny";
          break;
        // case "snow":
        case 600:
        case 601:
        case 602:
        case 611:
        case 612:
        case 615:
        case 616:
        case 620:
        case 621:
        case 622:
          conditionObj["banglaCondition"] = "তুষারপাত";
          conditionObj["conditionColor"] = "37474F";
          conditionObj["conditionIcon"] = "snow";
          conditionObj["conditionAnimation"] = "snowy";
          break;
        // case "chancerain":
        case 35:
        case 40:
          conditionObj["banglaCondition"] = "ভারী বৃষ্টিপাতের সম্ভাবনা";
          conditionObj["conditionColor"] = "424242";
          conditionObj["conditionIcon"] = "chancerain";
          conditionObj["conditionAnimation"] = "rainy";
        // case "drizzle":
        case 300:
        case 301:
        case 302:
        case 310:
        case 311:
        case 312:
        case 313:
        case 314:
        case 321:
          conditionObj["banglaCondition"] = "গুঁড়ি গুঁড়ি ব্রষ্টি";
          conditionObj["conditionColor"] = "424242";
          conditionObj["conditionIcon"] = "rain";
          conditionObj["conditionAnimation"] = "rainy";
          break;
        // case "rain":
        case 500:
        case 501:
        case 502:
        case 503:
        case 504:
        case 511:
        case 520:
        case 521:
        case 522:
        case 531:
          conditionObj["banglaCondition"] = "বৃষ্টিপাত";
          conditionObj["conditionColor"] = "424242";
          conditionObj["conditionIcon"] = "rain";
          conditionObj["conditionAnimation"] = "rainy";
          break;
        // case "chancetstorms":
        case 37:
        case 38:
        case 39:
        case 47:
          conditionObj["banglaCondition"] = "বজ্রসহ বৃষ্টিপাতের সম্ভাবনা";
          conditionObj["conditionColor"] = "424242";
          conditionObj["conditionIcon"] = "chancetstorms";
          conditionObj["conditionAnimation"] = "stormy";
          break;
        // case "tstorms":
        case 200:
        case 201:
        case 202:
        case 210:
        case 211:
        case 212:
        case 221:
        case 230:
        case 231:
        case 232:
          conditionObj["banglaCondition"] = "বজ্রসহ বৃষ্টিপাত";
          conditionObj["conditionColor"] = "424242";
          conditionObj["conditionIcon"] = "tstorms";
          conditionObj["conditionAnimation"] = "stormy";
          break;
        // case "flurries":
        case 41:
        case 42:
        case 43:
          conditionObj["banglaCondition"] = "তুষারপাত";
          conditionObj["conditionColor"] = "37474F";
          conditionObj["conditionIcon"] = "flurries";
          conditionObj["conditionAnimation"] = "snowy";
          break;
        // case "chancesnow":
        case 46:
          conditionObj["banglaCondition"] = "তুষারপাতের সম্ভাবনা";
          conditionObj["conditionColor"] = "37474F";
          conditionObj["conditionIcon"] = "snow";
          conditionObj["conditionAnimation"] = "snowy";
          break;
        // case "chanceflurries":
          conditionObj["banglaCondition"] = "বরফপাতের সম্ভাবনা";
          conditionObj["conditionColor"] = "37474F";
          conditionObj["conditionIcon"] = "flurries";
          conditionObj["conditionAnimation"] = "snowy";
          break;
        // case "sleet":
        case 18:
        case 19:
          conditionObj["banglaCondition"] = "বরফপাত";
          conditionObj["conditionColor"] = "37474F";
          conditionObj["conditionIcon"] = "flurries";
          conditionObj["conditionAnimation"] = "snowy";
          break;
        case 17:
        case 3200:
        default:
          conditionObj["banglaCondition"] = "অনিশ্চিত";
          conditionObj["conditionColor"] = "4527A0";
          conditionObj["conditionIcon"] = "untitled";
          conditionObj["conditionAnimation"] = "cloudy";
          break;
      }

      return conditionObj;
    }

    window.addEventListener('online',  $rootScope.reset_current_location());
    $rootScope.reset_current_location();
    
  });
