'use strict';
module.exports = exports = function(app) {
  app.controller('appController', ['$scope', '$http', 'Resource', 'D3', function($scope, $http, Resource, D3) {
    // Create the resource to get the data for the view/page.
    // var overviewResource = Resource('/api/someroute/to/data');
    var overviewResource = null;
    // Create the graph(s) for the view/page.
    $scope.d3Object = null;
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
     if (toState.name === 'overview') {
       $scope.currentView = 'overview';
       console.log('User navigated to overview page.');
     } else if (toState.name === 'customer') {
       $scope.currentView = 'customer';
       console.log('User navigated to customer page.');
     }
   });
   $scope.$on('$viewContentLoaded', function(){
     if ($scope.currentView === 'overview') {
       console.log('Overview page has been loaded into the view.');
       if ($scope.d3Object !== null) $scope.d3Object.stopUpdates();
       $scope.d3Object = D3('pie', 500, 500, overviewResource, 1000);
       $scope.d3Object.create();
       $scope.d3Object.startUpdates();
     } else if ($scope.currentView === 'customer') {
       console.log('Customer page has been loaded into the view.');
       if ($scope.d3Object !== null) $scope.d3Object.stopUpdates();
       $scope.d3Object = D3('bar', 500, 500, overviewResource, 1000);
       $scope.d3Object.create();
       $scope.d3Object.startUpdates();
       // ex: $scope.d3Object = D3('bar', 300, 300, customerResource, 500);
     }
   });
  }]);
};