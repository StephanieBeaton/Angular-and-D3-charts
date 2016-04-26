'use strict';
module.exports = exports = function(app) {
  app.controller('appController', ['$scope', '$http', 'Resource', 'D3', function($scope, $http, Resource, D3) {



    // Create the resource to get the data for the view/page.

    //  Resource comes from  js/client.js    require('./services')(app);
    // var overviewResource = Resource('/api/someroute/to/data');

    // in Production  D3 data
    // the parameter paased to the Resource constructor  is an API URL to the server
    //
    // var salespeopleResource = Resource('http://www.fasterbids.com/DataAccess/getordersbysalesperson?USERkey=EP65g4K-8Fg67');
    // var salespeopleResource = Resource('DataAccess/getordersbysalesperson?USERkey=EP65g4K-8Fg67');

    // in Development  D3 data
    // parameter passed in is path to file containing json object
    var overviewResource    = null;

    var salespeopleResource = Resource('./data/ordersBySalesperson.json');
    var testResource        = Resource('./data/ordersByCustomer.json');

    // =======================================================================

    // in Production  Drop Down Data

    //  http://fasterbids.com/DataAccess/GetPageDropDowns?USERkey=EP65g4K-8Fg67

    // in Development  Drop Down Data
    var dropDownResource = Resource('./data/dropDownContent.json');


   // =======================================================================
    //
    //  Watch for Drop Down Changes
    //
    // =======================================================================
    function watchForDropDownChanges(){
          var dropdownvalues = {};
          dropdownvalues.selectedSalesmen     = $scope.selectedSalesmen;
          dropdownvalues.selectedCustomer     = $scope.selectedCustomer;
          dropdownvalues.selectedProductType  = $scope.selectedProductType;
          dropdownvalues.selectedDistributor  = $scope.selectedDistributor;
          console.log("inside watch function");
          console.log("selected");
          console.log(dropdownvalues);

          if (!(dropdownvalues.selectedSalesmen    === undefined &&
                dropdownvalues.selectedCustomer    === undefined &&
                dropdownvalues.selectedProductType === undefined &&
                dropdownvalues.selectedDistributor === undefined  ))
          {
              if ($scope.d3Object !== null) $scope.d3Object.stopUpdates();
              if ($scope.currentView === 'overview'){
                $scope.d3Object = D3('pie', 500, 500, testResource, 6000000, dropdownvalues);
              } else if ($scope.currentView === 'customer'){
                $scope.d3Object = D3('bar', 800, 500, testResource, 6000000, dropdownvalues);
              } else {
                console.log("$scope.currentView ");
                console.log($scope.currentView);
                if ($scope.d3Object) {
                  console.log("calling buildChart() from watchForDropDownChanges because $scope.d3Object already exists.");
                  $scope.d3Object.buildChart(dropdownvalues);
                } else {
                  $scope.d3Object = D3('stacked-chart', 900, 500, salespeopleResource, 6000000, dropdownvalues);
                }
              }
          }
      }

    // =======================================================================

    //var overviewResource = null;

    // Create the graph(s) for the view/page.


    // =======================================================================
    //
    //  get Drop Down data
    //
    // =======================================================================

    dropDownResource.get(function(err, data) {

        // remove "s" from the end of all Product Type Names

        data.DropDowns.Products = data.DropDowns.Products.map(function(element){
          if (element.Name.endsWith('s') ){
            element.Name = element.Name.slice(0, -1);
          }
          return element;
        });

        // append two more Product Types
        data.DropDowns.Products.push({
          "Name": "Exterior",
          "Value": 98
        });

        data.DropDowns.Products.push({
          "Name": "Interior",
          "Value": 99
        });

        // add default value to each drop down array
        data.DropDowns.Products.unshift({
          "Name": "All Products",
          "Value": null
        });

        data.DropDowns.Distributors.unshift({
          "Name": "All Distributors",
          "Value": null
        });

        data.DropDowns.Customers.unshift({
          "Name": "All Customers",
          "Value": null
        });

        data.DropDowns.Salesmen.unshift({
          "Name": "All Salesmen",
          "Value": null
        });

        $scope.productTypesDropDown = data.DropDowns.Products;
        $scope.distributorsDropDown = data.DropDowns.Distributors;
        $scope.customersDropDown    = data.DropDowns.Customers;
        $scope.salesmenDropDown     = data.DropDowns.Salesmen;
    });

    // =======================================================================


    $scope.d3Object = null;
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
     if (toState.name === 'overview') {
       $scope.currentView = 'overview';
       console.log('User navigated to overview page.');
     } else if (toState.name === 'customer') {
       $scope.currentView = 'customer';
       console.log('User navigated to customer page.');
     } else if (toState.name === 'salespeople') {
       $scope.currentView = 'salespeople';
       console.log('User navigated to salespeople page.');
     }
   });
   $scope.$on('$viewContentLoaded', function(){


     // commented out because I think this is triggering the watch code
     //
     // $scope.selectedProductType = $scope.productTypesDropDown[0];
     // $scope.selectedDistributor = $scope.distributorsDropDown[0];
     // $scope.selectedCustomer = $scope.customersDropDown[0];
     // $scope.selectedSalesmen = $scope.salesmenDropDown[0];


     if ($scope.currentView === 'overview') {
       console.log('overview page has been loaded into the view.');
       if ($scope.d3Object !== null) $scope.d3Object.stopUpdates();
       $scope.d3Object = D3('pie', 500, 500, testResource, 6000000);

       $scope.$watch('selectedSalesmen', watchForDropDownChanges);
       $scope.$watch('selectedCustomer', watchForDropDownChanges);
       $scope.$watch('selectedProductType', watchForDropDownChanges);
       $scope.$watch('selectedDistributor', watchForDropDownChanges);


     } else if ($scope.currentView === 'customer') {
       console.log('Customer page has been loaded into the view.');
       if ($scope.d3Object !== null) $scope.d3Object.stopUpdates();
       $scope.d3Object = D3('bar', 800, 500, testResource, 6000000);

       $scope.$watch('selectedSalesmen', watchForDropDownChanges);
       $scope.$watch('selectedCustomer', watchForDropDownChanges);
       $scope.$watch('selectedProductType', watchForDropDownChanges);
       $scope.$watch('selectedDistributor', watchForDropDownChanges);


     } else if ($scope.currentView === 'salespeople') {
       console.log('Salespeople page has been loaded into the view.');
       if ($scope.d3Object !== null) $scope.d3Object.stopUpdates();

       $scope.d3Object = D3('stacked-chart', 900, 500, salespeopleResource, 6000000);

       $scope.$watch('selectedSalesmen', watchForDropDownChanges);
       $scope.$watch('selectedCustomer', watchForDropDownChanges);
       $scope.$watch('selectedProductType', watchForDropDownChanges);
       $scope.$watch('selectedDistributor', watchForDropDownChanges);

      }


   });
  }]);
};
