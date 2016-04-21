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
        if (this.type === 'bar') this.createBarChart();
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
    // basic bar chart
    D3.prototype.createBarChart = function() {
      var barWidth = 50,
          barPadding = 5,
          leftGutter = 75,
          color = this.color,
          // TODO: maybe abstract out any scale and axis functionality
          // that might be used by multiple chart types
          yScale = d3.scale.linear()
            // arbitrary domain
            .domain([0, 500])
            .range([this.height, 0]),
          yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(10)
            .tickFormat(function(d) { return "$" + format(d); }),
          format = d3.format(",");

      this.svg = d3.select('#graph')
        .append('svg:svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .append('svg:g')
        // draw y axis
        .attr("class", "axis")
        .attr("transform", "translate(" + (leftGutter - barPadding) + ",0)")
        .call(yAxis);

      this.svg.selectAll("g.bar")
        .data(this.data)
        .enter()
        .append("g")
        .attr("class", "bar")
        .append("rect");

      this.svg.selectAll("g.bar").select("rect")
        .attr("width", barWidth)
        .attr("height", function(d) { return d.value; })
        .transition()
        .duration(500)
        .style("fill", function(d, i) { return color(i); })
        .attr("x", function(d, i) { return (i * barWidth) + (i * barPadding) + leftGutter; })
        .attr("y", function(d) { return yScale(d.value); });

      // only create text nodes on the first draw of the chart
      if (this.svg.selectAll("g.bar").select("text").empty()) {
        this.svg.selectAll("g.bar")
          .append("text")
          .text(function(d) { return d.label });
      }

      /*
      this.svg.selectAll("g.bar").select("text")
        .transition()
        .duration(500)
        .attr("transform", function(d, i) {
          return "translate(" + ((i * barWidth + 30) + (i * barPadding) + leftGutter) + "," + (yScale(d.value) - 10) + ") rotate(270)";
        });
      */
    }
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
