'use strict';
module.exports = exports = function(app) {
  app.controller('appController', ['$scope', '$http', 'Resource', 'D3', function($scope, $http, Resource, D3) {
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
       // stuff happens here
     } else if ($scope.currentView === 'customer') {
       console.log('Customer page has been loaded into the view.');
     }
   });
  }]);
};
