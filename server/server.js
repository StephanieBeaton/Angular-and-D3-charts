'use strict';
const express = require('express'), path = require('path'), app = express();
app.use(express.static(__dirname + '/build'));
var dataRoute = require(path.join(__dirname, 'lib', 'routes', 'dataRoute.js'));
app.use('/api', dataRoute);
const port = process.env.PORT || 5000;
app.listen(port);
module.exports = exports = app;
