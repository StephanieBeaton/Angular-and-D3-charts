'use strict';
module.exports = exports = function(app) {
  app.directive('quotesTable', ['Resource', function(Resource) {
    function link($scope, el, attr) {
    	// NOTE: these colors match D3's category20c() set
    	$scope.cellColors = ["#3182bd",
    											 "#6baed6",
    											 "#9ecae1",
    											 "#c6dbef",
    											 "#e6550d",
    											 "#fd8d3c",
    											 "#fdae6b",
    											 "#fdd0a2",
													 "#31a354",
													 "#74c476",
													 "#a1d99b",
													 "#c7e9c0",
													 "#756bb1",
													 "#9e9ac8",
													 "#bcbddc",
													 "#dadaeb",
													 "#636363",
													 "#969696",
													 "#bdbdbd",
													 "#d9d9d9"];
    };

    return {
      link: link,
      restrict: "E",
      templateUrl : 'templates/quotesTable.html',
    }
  }]);
};
