'use strict';
const angular = require('angular');
const app = angular.module('app', []);

require('./services')(app);
require('./controllers')(app);
require('./directives')(app);
