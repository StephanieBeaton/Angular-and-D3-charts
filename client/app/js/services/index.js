'use strict'

module.exports = exports = function(app) {
  require('angular-spinners')
  require('./Resource')(app)
  require('./D3')(app)
  require('./quoteFilter')(app)
};
