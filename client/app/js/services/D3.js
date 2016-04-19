'use strict';
module.exports = exports = function(app) {
  app.factory('D3', [function() {
    var D3 = function(width, height, resource) {
      this.width = width;
      this.height = height;
      this.resource = resource;
    };
    return function(width, height, resource) {
      return new Resource(width, height, resource);
    };
  }]);
};
