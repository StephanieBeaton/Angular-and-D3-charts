'use strict'

//  This is "cb" passed in from  D3.js  buildChart( )
//
// function(err, data) {
//         this.dummyData = data;
//         this.resource = data;
//         self.create(data);
//         self.startUpdates();
//       }


var success = function(cb) {
  return function(res) {
    cb(null, res.data)
  }
}

var failure = function(cb) {
  return function(res) {
    cb(res)
  }
}

module.exports = exports = function(app) {
  app.factory('Resource', ['$http', function($http) {
    var Resource = function(resource) {

      //  In Development -
      //  "resource" is the path to the files containing json
      //  for example  ./data/ordersByCustomer.json
      //     localhost:5000/./data/ordersByCustomer.json
      //
      //  In Production -
      //  When migrated to production  "localhost:5000" will be fasterbids.com
      //      fasterbids.com/DataAccess/getordersbysalesperson?USERkey=EP65g4K-8Fg67
      //
      this.resource = resource
    }
    
    Resource.prototype.get = function(cb) {
      $http.get(this.resource).then(success(cb), failure(cb))
    }

    return function(resource) {
      return new Resource(resource)
    }
  }])
}
