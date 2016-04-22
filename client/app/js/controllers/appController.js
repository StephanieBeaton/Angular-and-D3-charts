'use strict';
module.exports = exports = function(app) {
  app.controller('appController', ['$rootScope', '$scope', '$http', 'Resource', 'D3', function($rootScope, $scope, $http, Resource, D3) {
    // Create the resource to get the data for the view/page.

    //  Resource comes from  js/client.js    require('./services')(app);
    // var overviewResource = Resource('/api/someroute/to/data');
    // var salespeopleResource = Resource('http://www.fasterbids.com/DataAccess/getordersbysalesperson?USERkey=EP65g4K-8Fg67');
    var overviewResource = null;
    var salespeopleResource = Resource('./data/ordersBySalesperson.json');
    var testResource = Resource('./data/ordersByCustomer.json');

    // D3 service instances will emit a 'dataUpdated' event when they fetch new data.
    // We'll store that data in scope here, and that way it will be available to 
    // directives and templates as well.
    $rootScope.$on('dataUpdated', function(evt, data) {
      $scope.currentData = data;
    });

    //var overviewResource = null;

    // Create the graph(s) for the view/page.
    $scope.d3Object = null;
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
     if (toState.name === 'overview') {
       $scope.currentView = 'overview';
       console.log('User navigated to overview page.');
     } else if (toState.name === 'customer') {
       $scope.currentView = 'customer';
       console.log('User navigated to customer page.');
     } else if (toState.name === 'salespeople') {
       $scope.currentView = 'salespeople';
       console.log('User navigated to salespeople page.');
     }
   });
   $scope.$on('$viewContentLoaded', function(){
     if ($scope.currentView === 'overview') {
       console.log('overview page has been loaded into the view.');
       if ($scope.d3Object !== null) $scope.d3Object.stopUpdates();
       $scope.d3Object = D3('pie', 500, 500, testResource, 6000000);
     } else if ($scope.currentView === 'customer') {
       console.log('Customer page has been loaded into the view.');
       if ($scope.d3Object !== null) $scope.d3Object.stopUpdates();
       $scope.d3Object = D3('bar', 800, 500, testResource, 6000000);       
     } else if ($scope.currentView === 'salespeople') {
       console.log('Salespeople page has been loaded into the view.');
       if ($scope.d3Object !== null) $scope.d3Object.stopUpdates();
       $scope.d3Object = D3('stacked-chart', 900, 500, salespeopleResource, 6000000);
     }

   });
  }]);
};
