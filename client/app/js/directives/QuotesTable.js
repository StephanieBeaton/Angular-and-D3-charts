'use strict';
module.exports = exports = function(app) {
  app.directive('quotesTable', [function() {
    function link($scope, el, attr) {
      
    
    };
    
    return {
      link: link,
      restrict: "E",
      templateUrl : 'templates/quotesTable.html',
    }

  }]);
};
