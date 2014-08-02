'use strict';


// Declare app level module which depends on filters, and services
var tribeApp = angular.module('tribeApp', [
  'ngRoute',
  'tribeApp.filters',
  'tribeApp.services',
  'tribeApp.directives',
  'tribeApp.controllers',
        'ngTouch',
        'ngAnimate'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/cards', {templateUrl: 'partials/card_view.html', controller: 'CardCtrl'});
  $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'loginController'});
  $routeProvider.when('/article/:id', {templateUrl: 'partials/article.html', controller: 'articleController'});
  $routeProvider.when('/comments/:id', {templateUrl: 'partials/comments.html', controller: 'commentsController'});
  $routeProvider.otherwise({redirectTo: '/cards'});
}]);