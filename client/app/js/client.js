'use strict';
const angular = require('angular');
require('angular-ui-router');
const app = angular.module('app', ['ui.router']);
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/overview');
  $stateProvider
    .state('overview', { url: '/overview', templateUrl: 'templates/overview.html' })
    .state('customer', { url: '/customer', templateUrl: 'templates/customer.html' });
  $locationProvider.html5Mode({ enabled: true, requireBase: false });
}]);
require('./services')(app);
require('./controllers')(app);
require('./directives')(app);
