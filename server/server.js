'use strict';
const express = require('express'), path = require('path'), app = express(), favicon = require('serve-favicon');
var dataRoutes = require(__dirname + '/lib/routes/dataRoutes');
app.use(express.static(__dirname + '/build'));
app.use(favicon(path.join(__dirname, 'build', 'images', 'favicon.ico')));
app.use('/api', dataRoutes);
const port = process.env.PORT || 5000;
app.listen(port);
module.exports = exports = app;
