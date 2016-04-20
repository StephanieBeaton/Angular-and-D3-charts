'use strict';
var success = function(cb) { return function(res) { cb(null, res.data); }; };
var failure = function(cb) { return function(res) { cb(res); }; };
module.exports = exports = function(app) {
  app.factory('Resource', ['$http', function($http) {
    var Resource = function(resource) {
      this.resource = resource;
    };
    Resource.prototype.get = function(cb) {
      $http.get(this.resource).then(success(cb), failure(cb));
    };
    return function(resource) {
      return new Resource(resource);
    };
  }]);
};
