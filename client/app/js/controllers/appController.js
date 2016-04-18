'use strict';
module.exports = exports = function(app) {
  app.controller('appController', ['$scope', '$http', 'Resource', 'D3', function($scope, $http, Resource, D3) {
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
     if (toState.name === 'overview') {
       $scope.currentView = 'overview';
     } else if (toState.name === 'customer') {
       $scope.currentView = 'customer';
     }
   });
   $scope.$on('$viewContentLoaded', function(){
     if ($scope.currentView === 'overview') {
       // stuff happens here
     }
   });
  }]);
};
