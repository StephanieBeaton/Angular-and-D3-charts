'use strict'

const angular = require('angular')
require('angular-local-storage')
require('angular-spinners')
require('angular-ui-router')

const app = angular.module('app', ['ui.router', 'angularSpinners', 'LocalStorageModule'])

require('./services')(app)
require('./controllers')(app)
require('./directives')(app)

app.config(['$compileProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', 'localStorageServiceProvider',
function($compileProvider, $stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider) {
  // $compileProvider
  //   .debugInfoEnabled(false)

  $urlRouterProvider.otherwise('/overview')

  $stateProvider
    .state('overview', {
      url: '/overview',
      templateUrl: 'templates/overview.html'
    })
    .state('customer', {
      url: '/customer',
      templateUrl: 'templates/customer.html'
    })
    .state('salespeople', {
      url: '/salespeople',
      templateUrl: 'templates/salespeople.html',
      controller: 'appController'
    })

  $locationProvider.html5Mode({ enabled: true, requireBase: false })

  localStorageServiceProvider
    .setPrefix('fasterViz')
}])
