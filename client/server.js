'use strict';
const express = require('express');
const port = process.env.PORT || 9000;
const app = express();
process.on('exit', function() {
  console.log();
  console.log('Net Arts Client application now exiting.');
  console.log();
  process.exit(0);
});
process.on('SIGINT', function() {
  console.log();
  console.log('Client server on port ' + port + ' closed due to termination from the console.');
  console.log();
  process.exit(0);
});
process.on('uncaughtException', function() {
  console.log();
  console.log('Uncaught exception from server on port ' + port + '.');
  console.log();
});
module.exports = exports = app.use(express.static(__dirname + '/build')).listen(port, function() {
  console.log();
  console.log('Client server now running on port ' + port + '.');
  console.log();
});
