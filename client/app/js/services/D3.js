'use strict';
module.exports = exports = function(app) {
  app.factory('D3', [function() {
    var d3 = require('d3');
    var D3 = function(type, width, height, resource, updateInterval) {
      this.type = type;
      this.width = width;
      this.height = height;
      this.resource = resource;
      // The updateInterval is the rate at which the graph will check for new data and refresh itself.  This value is in milliseconds (ex: 1000 = 1 update/second).
      this.updateInterval = updateInterval;
      // The specified with determines a pie chart's radius.
      if (this.type === 'pie') this.radius = this.width / 2;
      // Color range to use for now.
      this.color = d3.scale.category20c();
      // Sets this data to be used if the the D3 object's resource argument is null.
      this.dummyData = [{ 'label':'Stuff', 'value':40 }, { 'label':'Other Stuff', 'value':50 }, { 'label':'Things', 'value':30 }];
      this.data = this.resource === null ? this.dummyData : this.resource.get(function(data) { return data; });
    };
    D3.prototype.create = function() {
      // Remove child elements if they're there.
      if (this.data !== null) {
        var graph = document.getElementById('graph');
        if (graph.hasChildNodes()) while (graph.firstChild) graph.removeChild(graph.firstChild);
        // Decide which create function to run, depends on the D3 object's type.
        if (this.type === 'pie') this.createPieChart();
      }
    };
    // Chart/Graph Creation Functions
    D3.prototype.createPieChart = function() {
      this.chart = d3.select('#graph')
        .append('svg:svg')
        .data([this.data])
        .attr('width', this.width)
        .attr('height', this.height)
        .append('svg:g')
        .attr('transform', 'translate(' + this.radius + ',' + this.radius + ')');
      this.pie = d3.layout.pie()
        .value(function(d) { return d.value; });
      this.arc = d3.svg.arc()
        .outerRadius(this.radius);
      this.arcs = this.chart.selectAll('g.slice')
        .data(this.pie)
        .enter()
        .append('svg:g')
        .attr('class', 'slice');
      // Declare local scope variables for use in anonymous functions to avoid scope issues.
      var color = this.color, arc = this.arc, data = this.data, radius = this.radius;
      this.arcs.append('svg:path')
        .attr('fill', function(d, i) { return color(i); })
        .attr('d', function(d) { return arc(d); });
      this.arcs.append('svg:text')
        .attr('transform', function(d) {
          d.innerRadius = 0;
          d.outerRadius = radius;
          return 'translate(' + arc.centroid(d) + ')';
        })
        .attr('text-anchor', 'middle')
        .text(function(d, i) { return data[i].label; });
    };
    // Chart/Graph Update Functions
    D3.prototype.startUpdates = function() {
      var d3Object = this;
      this.updates = setInterval(function() {
        console.log('Updating the D3 object.');
        d3Object.data = d3Object.resource !== null ? d3Object.resource.get(function(data) { return data; }) : d3Object.data;
        d3Object.create();
      }, this.updateInterval);
    };
    D3.prototype.stopUpdates = function() {
      if (typeof this.updates !== 'undefined') clearInterval(this.updates);
    };
    return function(type, width, height, resource, updateInterval) {
      return new D3(type, width, height, resource, updateInterval);
    };
  }]);
};
