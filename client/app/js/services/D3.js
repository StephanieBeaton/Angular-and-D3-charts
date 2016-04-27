'use strict';

module.exports = exports = function(app) {
  app.factory('D3', ['$rootScope', function($rootScope) {
    var d3 = require('d3');
    //var d3_tip = require('d3-tip');

    // ===========================================================
    //   D3 constructor function
    //
    // called from js/controllers/appControllers.js
    //    $scope.d3Object = D3('pie', 500, 500, overviewResource, 1000);
    //    $scope.d3Object = D3('stacked-chart', 960, 500, salespeopleResource, 1000);
    // ===========================================================
    var D3 = function(type, width, height, dataFilteredByDropDowns) {
      this.type = type;
      this.width = width;
      this.height = height;

      // The specified with determines a pie chart's radius.
      if (this.type === 'pie') this.radius = this.width / 2;
      // Color range to use for now.
      if (this.type != 'stacked-chart') this.color = d3.scale.category20c();

      this.buildChart(dataFilteredByDropDowns);
    };

    // ===========================================================
    //   create()
    //
    //   if chart exists, remove all its child elements
    //   ...  then call createPieChart()
    //
    //   called in D3.prototype.startUpdates()
    // ===========================================================
    D3.prototype.create = function(data) {
      // Decide which create function to run, depends on the D3 object's type.
      if (this.type === 'pie') this.createPieChart(data);
      if (this.type === 'stacked-chart') this.createStackedChart(data);
      if (this.type === 'bar') this.createBarChart(data);
    };

    D3.prototype.buildChart = function(data) {

      this.create(data);

    };
    // Chart/Graph Creation Functions
    D3.prototype.createPieChart = function(data) {

      //  Does <svg> already exist?  If so do not add another one.
      var svg = d3.select('svg');
      console.log("svg");
      console.log(svg);
      console.log("");
      console.log("svg.empty()");
      console.log(svg.empty());

      if (svg.empty()){

        this.chart = d3.select('#graph')
          .append('svg:svg');
      } else {
        this.chart = d3.select('svg');
      }

        this.chart.data([data])
          .attr('width', this.width)
          .attr('height', this.height)
          .append('svg:g')
          .attr('transform', 'translate(' + this.radius + ',' + this.radius + ')');
        this.pie = d3.layout.pie()
          .value(function(d) {
            var total = 0;
            for (var k in d.Totals) {
              total += d.Totals[k];
            }
            return total;
          });


        this.arc = d3.svg.arc()
          .outerRadius(this.radius);

        this.arcs = this.chart.selectAll('g.slice')
          .data(this.pie);

        // new data
        this.arcs
          .enter()
          .append('svg:g')
          .attr('class', 'slice');
        // Declare local scope variables for use in anonymous functions to avoid scope issues.
        var color = this.color, arc = this.arc, radius = this.radius;

        //  .transition().duration(1500)
        this.arcs.append('svg:path')
          .attr('fill', function(d, i) { return color(i); })
          .attr('d', function(d) { return arc(d); });

        // remove old text
        // this.arcs.selectAll('.pie-text').remove();   // new

        this.arcs.append('svg:text')
          .attr('class', 'pie-text')
          .attr('transform', function(d) {
            d.innerRadius = 0;
            d.outerRadius = radius;
            return 'translate(' + arc.centroid(d) + ')';
          })
          .attr('text-anchor', 'middle')
          .text(function(d, i) { return d.Name; });

    };

    // basic bar chart
    D3.prototype.createBarChart = function(data) {
      var barWidth = 15,
          barPadding = 5,
          leftGutter = 75,
          color = this.color,
          // TODO: maybe abstract out any scale and axis functionality
          // that might be used by multiple chart types
          yScale = d3.scale.linear()
            // arbitrary domain
            .domain([0, 30000])
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
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar")
        .append("rect");

      this.svg.selectAll("g.bar").select("rect")
        .attr("width", barWidth)
        .attr("height", function(d) {
          var total = 0;
          for (var k in d.Totals) {
            total += d.Totals[k];
          }
          return total;
        })
        .transition()
        .duration(500)
        .style("fill", function(d, i) { return color(i); })
        .attr("x", function(d, i) { return (i * barWidth) + (i * barPadding) + leftGutter; })
        .attr("y", function(d) {
          var total = 0;
          for (var k in d.Totals) {
            total += d.Totals[k];
          }
          return yScale(total);
        });

      // only create text nodes on the first draw of the chart
      if (this.svg.selectAll("g.bar").select("text").empty()) {
        this.svg.selectAll("g.bar")
          .append("text")
          .text(function(d) { return d.Name; });
      }

      this.svg.selectAll("g.bar").select("text")
        .transition()
        .duration(500)
        .attr("transform", function(d, i) {
          var total = 0;
          for (var k in d.Totals) {
            total += d.Totals[k];
          }
          return "translate(" + ((i * barWidth + 12) + (i * barPadding) + leftGutter) + "," + (yScale(total) - 10) + ") rotate(270)";
        });
    };


    // ===========================================================
    //   createStackedChart  -  sort of private function
    //
    // called from D3.prototype.create in this file
    //
    // ===========================================================
    D3.prototype.createStackedChart = function(data) {


            console.log("inside createStackedChart");
            console.log("data");
            console.log(data);

            // ============================================================
            // loop thru data array
            // ... and create an object whose properties are all Product types in data
            var productTypeObj = {};
            data.forEach(function(d){

              for (var property in d.Totals) {
                  if (d.Totals.hasOwnProperty(property)) {
                      productTypeObj[property] = 0;
                  }
              }

            });

             // console.log("productTypeObj");
             // console.log(productTypeObj);


             // loop thru the properties of productTypeObj
             // and create an array of strings of the properties of productTypeObj

              var productTypes = [];

              for (var property in productTypeObj) {
                  if (productTypeObj.hasOwnProperty(property)) {
                      productTypes.push(property);
                  }
              }

              // console.log("productTypes");
              // console.log(productTypes);

             // ============================================================

              //  loop thru data array
              //  If an item/object in the array is missing one of the product types in ProductTypes
              //  ... then add the property to the item/object
             // ============================================================

             data.forEach(function(d){

                 productTypes.forEach(function(productType){

                    if (d.Totals.hasOwnProperty(productType) === false) {
                      d.Totals[productType] = 0;
                    }
                 });
             });


             var padding = 20;
             var pathClass="path";
             var xScale, yScale, xAxisGen, yAxisGen, lineFun;


             // ============================================================

              var margin = {top: 20, right: 20, bottom: 30, left: 40},
                  width = this.width - margin.left - margin.right,
                  height = this.height - margin.top - margin.bottom;

              // function that translates x data values into x coordinate values
              //  origin 0,0 is at top left corner of svg element
              var x = d3.scale.ordinal()
                  .rangeRoundBands([0, width], 0.1);

              // function that translates x data values into x coordinate values
              //  origin 0,0 is at top left corner of svg element
              var y = d3.scale.linear()
                  .rangeRound([height, 0]);

              // function that translates column data name ? hex color values
              //
              //  change colors later

              //   There are 7 product type items,  so there must be 7 matching colors only
              //
              var colorArray = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];
              var color = d3.scale.ordinal()
                  .range(colorArray);

              // labels for x axis are beneath x axis
              var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom");

              // labels for y axis are to left of y axis
              var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient("left")
                  .tickFormat(d3.format(".2s"));


              //  Does <svg> alrready exist?  If so do not add another one.
              var svg = d3.select('svg');
              console.log("svg");
              console.log(svg);
              console.log("");
              console.log("svg.empty()");
              console.log(svg.empty());

              if (svg.empty()){
                console.log("create new svg");
                console.log("");
                d3.select('#graph')
                  .append('svg');


                // single g group element parent of all other elements in svg

                svg = d3.select('svg')
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("class", "child")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                this.chart = svg;   // not convinced this is necessary for stacked-chart

              } else {
                svg = d3.select('.child');
              }


                // set domain of color scale
                // this returns all the keys in one object in the array of objects "data"
                // These keys are the column slices names
                //
                //  COLOR DOMAIN
                //
                // Interior: 5310.9,
                // Exterior: 47411.01,
                // Window: 26725.215,
                // Moulding: 1741.07,
                // Siding: 476.5,
                // Decking: 11469.92,
                // Skylight: 10215.76,
                // Siding:

                //     The "domain" of the Totals object is calculated before this point in the code !!
                //
                // {
                //   Totals: {
                //     Interior: 1,
                //     Exterior: 47411.01,
                //     Window: 26725.215,
                //     Moulding: 1741.07,
                //     Siding: 476.5,
                //     Decking: 11469.92,
                //     Skylight: 10215.76
                //     Siding: 1
                //   },
                //   Name: "Test User",
                //   Id: 7
                // }

                // var productTypes = ["Interior", "Exterior", "Window", "Moulding", "Siding", "Decking", "Skylight"];

                if (productTypes.length > colorArray.length) {
                  alert("There are more product types than there are colors.  Need to add more colors");
                }

                // the number of colors must equal the number of product types
                //  There should be same number in both for ordinal() scale

                color.domain(productTypes);

                // for each object in the data array (d)
                // .. create cummulativeSales array and sort it by productVolume
                data.forEach(function(d) {
                  d.cummulativeSales = color.domain().map(function(name) { return {name: name, y0: 0,  productVolume: +d.Totals[name], y1: 0}; });

                  // console.log("d.cummulativeSales");
                  // console.log(d.cummulativeSales);

                 // sort items in cummulativeSales array by productVolume descending
                  d.cummulativeSales.sort(function(a, b) { return b.productVolume - a.productVolume;});

                });

                // for each object in the data array
                // calculate  y0 and y1
                //
                // ... add new key:value pairs to the object
                // ...   cummulativeSales:   an array of objects    (changed  ages --> cummulativeSales)
                // ...   total:  999
                data.forEach(function(d) {
                  var y0 = 0;

                  // loop thru the color domain using the string values as keys to access
                  // ... values in key:value pairs in the object d
                  // ... and calculate running totals of data counts of people in the age categories
                  // ... These are the tops and bottoms of the "stripes" in the column
                  // ... in data units (not translated into y coordinates)
                  // d.cummulativeSales is an array of objects
                  // Each d.cummulativeSales object represents one stripe in the column
                  d.cummulativeSales = d.cummulativeSales.map(function(dObj) { return {name: dObj.name, y0: y0,  productVolume: dObj.productVolume, y1: y0 += dObj.productVolume}; });

                  // top of column in data values (not in y coordinates)
                  d.total = d.cummulativeSales[d.cummulativeSales.length - 1].y1;
                });

                // sort the objects in "data" array in desc order by data values of the top of the column
                data.sort(function(a, b) { return b.total - a.total; });

                // set x domain... which are the salespeople names
                // ... iterate thru all the objects in "data" array
                // ... Get the  values for "Name" key
                x.domain(data.map(function(d) { return d.Name; }));

                // set y domain ...
                // ... iterate thru the objects in data array
                // ... Find the  max value with key = "total"
                y.domain([0, d3.max(data, function(d) { return d.total; })]);

                // add x axis
                var x_axis = svg.select(".x");

                if (!x_axis.empty()) {
                  x_axis.remove();
                }

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);


                // add y axis
                // ... fancy code to handle y axis labels
                var y_axis = svg.select(".y");

                if (!y_axis.empty()) {
                  y_axis.remove();
                }

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                  .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Volume");

                //  STOPPED WORKING AFTER MERGE WITH  JAMES SERVICES CONCEPT

                // tool tip
                // http://bl.ocks.org/Caged/6476579
                // var tip = d3_tip.tip()
                // .attr('class', 'd3-tip')
                // .offset([-10, 0])
                // .html(function(d) {
                //   return "<strong style='color:red'>Volume:</strong> <span style='color:red'>" + d.total + "</span>";
                // });

                // svg.call(tip);


                //  http://javascript.tutorialhorizon.com/2014/11/20/a-visual-explanation-of-the-enter-update-and-exit-selections-in-d3js/
                //  enter() selection - rep­re­sents map­pings to DOM nodes
                //  ...  that will need to be cre­ated in order to map the excess data points.
                //
                //  each of these new g elements is a column
                //  The data for each g element is the object in the data array


                var state = svg.selectAll(".salesperson")
                    .data(data, function(d){ return d.Name; });

                // new data
                //                     .attr("class", "g")   removed
                state.enter().append("g")
                    .attr("class", "salesperson")
                    .attr("x", 0)
                    .transition().duration(1500)
                    .attr("transform", function(d) { return "translate(" + x(d.Name) + ",0)"; });

                // removed data:
                state.exit().remove();

                // updated data:
                state.attr("class", "salesperson")
                     .attr("x", 0)
                     .transition().duration(1500)
                     .attr("transform", function(d) { return "translate(" + x(d.Name) + ",0)"; });


               // STOPPED WORKING AFTER MERGE WITH JAMES SERVICES CONCEPT
               // tool tip
               // var columns = svg.selectAll(".g")
               //      .on('mouseover', tip.show)
               //      .on('mouseout', tip.hide);
               // ===========================================================

                // You are appending the text to rect elements -- this isn't valid in SVG
                // and the text won't show up.
                // Instead, append the text either to a g element or the top-level SVG:

                console.log("before remove()");
                svg.selectAll("text.bar").remove();
                console.log("after remove()");

                svg.selectAll("text.bar")
                  .data(data)
                .enter().append("text")
                  //.attr("transform", "rotate(-90)")
                  //.attr("class", "bar")
                  .attr("text-anchor", "middle")
                  .attr("class", "bar")
                  .attr("x", function(d) { return x(d.Name) + x.rangeBand()/2; })
                  .attr("y", function(d) { return height - 30; })
                  .style("fill", "black")
                  .text(function(d) { return d.Name; });

                // ===========================================================

                // now put set of rect element inside each g element
                //  Iterates over the cummulativeSales array and adds one rect per cummulativeSales element

                // ... rect element has width and height
                // Inherits  data object from parent element
                //
                //  cummulativeSales array elements are the data here

                /*
                state.selectAll("rect")
                    .data(function(d) { return d.cummulativeSales; })
                  .enter().append("rect")
                    .transition().duration(750)
                    .attr("width", x.rangeBand())
                    .attr("y", function(d) { return y(d.y1); })
                    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
                    .style("fill", function(d) { return color(d.name); });
                */

                var bar = state.selectAll("rect")
                            .data(function(d) { return d.cummulativeSales; });  // doesn't this need another function ?

                // new data
                bar.enter().append("rect")
                    .attr("width", x.rangeBand())
                    .attr("y", function(d) { return y(d.y1); })
                    .attr("height", function(d) { return 0; })
                    .transition().duration(1500)
                    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
                    .style("fill", function(d) { return color(d.name); });

                // removed data:
                bar.exit().remove();

                // updated data:
                 bar.attr("y", function(d) { return y(d.y1); })
                    .attr("width", x.rangeBand())
                    .attr("height", function(d) { return 0; })
                    .transition().duration(1500)
                    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
                    .style("fill", function(d) { return color(d.name); });

                   // "x" is set from parent element g ??
                   // not added from "enter()".


                // add fancy legend
                //
                // append some g elements
                //
                // slice does not alter.
                // It returns a shallow copy of elements from the original array.
                // Elements of the original array are copied into the returned array
                var legend = svg.selectAll(".legend")
                    .data(color.domain().slice().reverse())
                  .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                // put rect inside legend g elements with width and height
                legend.append("rect")
                    .attr("x", width - 18)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", color);

                legend.append("text")
                    .attr("x", width - 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "end")
                    .text(function(d) { return d; });

    };     //  D3.prototype.createStackedChart = function() {


    // ===========================================================
    //  return
    // ===========================================================
    return function(type, width, height, resource, updateInterval, selected) {
      return new D3(type, width, height, resource, updateInterval, selected);
    };
  }]);
};

