'use strict';

/**
 * @ngdoc function
 * @name abohawaApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the abohawaApp
 */
angular.module('abohawaApp')
  .controller('AboutCtrl', function ($scope, $route, $rootScope) {
  	$rootScope.title = $route.current.title;
  	$rootScope.setTab(2);

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
