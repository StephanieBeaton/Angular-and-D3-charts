'use strict';
module.exports = exports = function(app) {
  app.directive('customersTable', [function() {
    function link($scope, el, attr) {
      
    
    };
    
    return {
      link: link,
      restrict: "E",
      templateUrl : 'templates/customersTable.html',
    }

  }]);
};
