'use strict';

/**
 * @ngdoc overview
 * @name abohawaApp
 * @description
 * # abohawaApp
 *
 * Main module of the application.
 */
var appModule = angular
  .module('abohawaApp', [
    'ngRoute',
    'ngTouch'
  ])
  .controller('AppCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope, $translate) {


  }]);

  appModule.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

      if(window.history && window.history.pushState){
        $locationProvider.html5Mode(true);
      }
  }]);
