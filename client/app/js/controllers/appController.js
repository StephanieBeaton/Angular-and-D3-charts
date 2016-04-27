'use strict';

// =====================================================================

var salespeopleDummyData =
    [
      {
        "Totals": {},
        "Name": "mail Test",
        "Id": 5
      },
      {
        "Totals": {
          "Exterior": 13887.15,
          "Window": 16777.215,
          "Interior": 3026.09,
          "Decking": 6840.5,
          "Skylight": 3985.43,
          "Moulding": 1721.83,
          "Siding": 202.89
        },
        "Name": "Test User",
        "Id": 7
      },
      {
        "Totals": {
          "Skylight": 157.84,
          "Window": 6978.52
        },
        "Name": "Jason Lindquist",
        "Id": 94
      },
      {
        "Totals": {},
        "Name": "Jason Parchomchuk",
        "Id": 262
      },
      {
        "Totals": {
          "Interior": 446.32,
          "Moulding": 83.2,
          "Window": 202,
          "Skylight": 207
        },
        "Name": "Jason Lindquist",
        "Id": 300
      },
      {
        "Totals": {
          "Siding": 3.87
        },
        "Name": "Jonny Tester",
        "Id": 301
      }
    ];

// ==========================================================================

var customerDummyData = [{ 'label':'Stuff',       'value':40 },
                        { 'label':'Other Stuff', 'value':50 },
                        { 'label':'Things',      'value':30 }];

// ==========================================================================

var dropdownDummyData =
    {
    "DropDowns": {
        "Salesmen": [
          {
            "Name": "Test User",
            "Value": 7
          }
        ],
      "Customers": [
          {
            "Name": "Auto Save",
            "Value": 8
          }
        ],
      "Products": [
          {
            "Name": "Doors",
            "Value": 1
          }
        ],
      "Distributors": [
          {
            "Name": "Atrium",
            "Value": 5
          }
       ]
      }
    };


// ==========================================================================

module.exports = exports = function(app) {

  app.controller('appController', ['$rootScope', '$scope', '$http', 'Resource', 'D3', function($rootScope, $scope, $http, Resource, D3) {


    // $scope  - documentation
    //
    // $scope.customerFilteredData
    // $scope.customerData
    // $scope.customerUpdates  -  setInterval
    //
    // $scope.salespeopleFilteredData
    // $scope.salespeopleData
    // $scope.salespeopleUpdates  - setInterval
    //
    // $scope.dropdownData
    //
    // $scope.currentView === 'overview' || 'customer' || 'salespeople'
    //
    // $scope.d3Object - initialized by D3 constructor
    //
    // $scope.selectedSalesmen;
    // $scope.selectedCustomer;
    // $scope.selectedProductType;
    // $scope.selectedDistributor;
    //
    //  CURRENTLY NOT USED
    // $scope.currentData ;
    // $scope.uniqueCategories = getUniqueCategories(data);
    //
    //  DROP DOWN CONTENTS
    //
    // $scope.productTypesDropDown
    // $scope.distributorsDropDown
    // $scope.customersDropDown
    // $scope.salesmenDropDown
    //


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
    var customerResource    = Resource('./data/ordersByCustomer.json');
    var quoteResource       = null;

    // =======================================================================

    // in Production  Drop Down Data

    //  http://fasterbids.com/DataAccess/GetPageDropDowns?USERkey=EP65g4K-8Fg67

    // in Development  Drop Down Data
    var dropDownResource = Resource('./data/dropDownContent.json');




    var resources = [];
    resources.push({  name: "salespeople", resource: salespeopleResource, dummyData: salespeopleDummyData, updateInterval: 6000000});
    resources.push({  name: "customer",    resource: customerResource,    dummyData: customerDummyData,    updateInterval: 6000000});
    resources.push({  name: "dropdown",    resource: dropDownResource,    dummyData: dropdownDummyData,    updateInterval: 6000000});

    // resources.push({  name: "quote",       resource: quoteResource,       dummyData: quoteDummyData});



    // ===========================================================
    //   startUpdates  -  get data from the server every updateInterval milliseconds
    //                 -  store data on $scope
    //
    // called from js/controllers/appController.js
    //
    // ===========================================================
    function startUpdates(resourceObj) {

      $scope[resourceObj.name + "Updates"] = setInterval(function() {
        console.log('Updating ' + resourceObj.name);

        if (resourceObj.resource === null){
            $scope[resourceObj.name + "Data"] = resourceObj.dummyData;

            // if (resourceObj.name !== "dropdown"){
            //   $scope[resourceObj.name + "FilteredData"] = resourceObj.dummyData;
            // }
        } else {

            resourceObj.resource.get(function(err, data) {

                console.log("inside appController.js startUpdates()");
                console.log("inside async function of resourceObj.resource.get");

                $scope[resourceObj.name + "Data"] = data;

                // ==========================================
                //  filter data with dropdownvalues
                // ==========================================
                // if (resourceObj.name !== "dropdown"){
                //   $scope[resourceObj.name + "FilteredData"] = filterD3Data(data, resourceObj.name);
                // }

                // DO NOT DRAW A CHART
                // $scope.currentView === 'overview' || 'customer' || 'salespeople'
                // buildChart($scope.salespeopleFilteredData);
            });

        }
       }, resourceObj.updateInterval);
    }

    // ===========================================================
    //   stopUpdates  -  stop "setInterval", stop getting data from server
    //
    // called from js/controllers/appController.js
    //
    // ===========================================================
    function stopUpdates(resourceObj) {
      if (typeof $scope[resourceObj.name + "Updates"] !== 'undefined') clearInterval($scope[resourceObj.name + "Updates"]);
    }



    // =======================================================================
    //
    //  getDataFromServer - get data from the server
    //  ... call each API
    //
    // =======================================================================
    function getDataFromServer(){

      console.log("inside getDataFromServer()");

      resources.forEach(function(resourceObj){

         console.log("resourceObj");
         console.log(resourceObj);

         if (resourceObj.resource === null){
            console.log("resourceObj.resource is null");
            $scope[resourceObj.name + "Data"] = resourceObj.dummyData;

            console.log(resourceObj.name + "Data");
            console.log($scope[resourceObj.name + "Data"]);

            // if (resourceObj.name !== "dropdown"){
            //   $scope[resourceObj.name + "FilteredData"] = resourceObj.dummyData;
            // }
          } else {

             resourceObj.resource.get(function(err, data) {
                // emit an event up the scope chain with the newly fetched data
                // $rootScope.$emit('dataUpdated', data);

                console.log("inside resourceObj.resource.get()");

                $scope[resourceObj.name + "Data"] = data;

                console.log(resourceObj.name + "Data");
                console.log($scope[resourceObj.name + "Data"]);



                // ==========================================
                //  filter data with dropdownvalues
                // ==========================================

                // if (resourceObj.name !== "dropdown"){
                //   $scope[resourceObj.name + "FilteredData"] = filterD3Data(data, resourceObj.name);
                // }

                // if chart already exists then redraw chart
                // if ($scope.d3Object !== null) { }
                // $scope.currentView === 'overview' || 'customer' || 'salespeople'
                // buildChart($scope.salespeopleFilteredData);

                // temporarily commented out for debugging
                // stopUpdates(resourceObj);
                // startUpdates(resourceObj);
              });
          }

      });
    }

    getDataFromServer();

    // =======================================================================
    //
    //  Watch for Drop Down Changes
    //
    // =======================================================================
    function watchForDropDownChanges(){
          var temp;
          var dropdownvalues = {};
          dropdownvalues.selectedSalesmen     = $scope.selectedSalesmen;
          dropdownvalues.selectedCustomer     = $scope.selectedCustomer;
          dropdownvalues.selectedProductType  = $scope.selectedProductType;
          dropdownvalues.selectedDistributor  = $scope.selectedDistributor;

          $scope.dropdownvalues = dropdownvalues;

          console.log("inside watch function");
          console.log("selected");
          console.log(dropdownvalues);

          if (!(dropdownvalues.selectedSalesmen    === undefined &&
                dropdownvalues.selectedCustomer    === undefined &&
                dropdownvalues.selectedProductType === undefined &&
                dropdownvalues.selectedDistributor === undefined  ))
          {
              if ($scope.currentView === 'overview'){

                 // stop updates

                 // temporarily commenting out
                 // resources.forEach(function(resourceObj){
                 //   if (resourceObj.name === "customer"){
                 //     if ($scope[resourceObj.name + "Updates"] !== null){
                 //       stopUpdates(resourceObj);
                 //     }
                 //   }
                 // });

                temp = filterD3Data($scope.customerData, "customer");

                if ($scope.d3Object) {
                  console.log("calling buildChart() from watchForDropDownChanges because $scope.d3Object already exists.");
                  $scope.d3Object.buildChart(temp);
                } else {
                  $scope.d3Object = D3('pie', 500, 500, temp);
                }

                 // start updates

                 // temporarily commenting out
                 // resources.forEach(function(resourceObj){
                 //   if (resourceObj.name === "customer"){
                 //     startUpdates(resourceObj);
                 //   }
                 // });

              } else if ($scope.currentView === 'customer'){

                 // stop updates

                 // temporarily commenting out
                 // resources.forEach(function(resourceObj){
                 //   if (resourceObj.name === "customer"){
                 //     if ($scope[resourceObj.name + "Updates"] !== null){
                 //       stopUpdates(resourceObj);
                 //     }
                 //   }
                 // });

                temp = filterD3Data($scope.customerData, "customer");

                if ($scope.d3Object) {
                  console.log("calling buildChart() from watchForDropDownChanges because $scope.d3Object already exists.");
                  $scope.d3Object.buildChart(temp);
                } else {
                  $scope.d3Object = D3('bar', 800, 500, temp);
                }

                 // start updates

                 // temporarily commenting out
                 // resources.forEach(function(resourceObj){
                 //   if (resourceObj.name === "customer"){
                 //     startUpdates(resourceObj);
                 //   }
                 // });

              } else {
                console.log("$scope.currentView ");
                console.log($scope.currentView);

                console.log("before filterD3Data() call");
                console.log("$scope.salespeopleData");
                console.log($scope.salespeopleData);


                 // stop updates

                 // temporarily commenting out
                 // resources.forEach(function(resourceObj){
                 //   if (resourceObj.name === "salespeople"){
                 //     if ($scope[resourceObj.name + "Updates"] !== null){
                 //       stopUpdates(resourceObj);
                 //     }
                 //   }
                 // });

                temp = filterD3Data($scope.salespeopleData, "salespeople");

                console.log("after filterD3Data() call");
                console.log("$scope.salespeopleData");
                console.log($scope.salespeopleData);

                if ($scope.d3Object) {
                  console.log("calling buildChart() from watchForDropDownChanges because $scope.d3Object already exists.");
                  $scope.d3Object.buildChart(temp);
                } else {
                  $scope.d3Object = D3('stacked-chart', 900, 500, temp);
                }

                 // start updates

                 // temporarily commenting out
                 // resources.forEach(function(resourceObj){
                 //   if (resourceObj.name === "salespeople"){
                 //     startUpdates(resourceObj);
                 //   }
                 // });

              }
          }
      }

    // =======================================================================

    // Build an array of unique categories from the Totals object.
    // This is useful for creating the table views.
    var getUniqueCategories = function(data) {
      var uniqueCategories = [],
          seenCategories = {};
      data.forEach(function(item) {
        Object.keys(item.Totals).forEach(function(key) {
          if (!seenCategories.hasOwnProperty(key)) {
            uniqueCategories.push(key);
            seenCategories[key] = true;
          }
        });
      });

      return uniqueCategories;
    };


    //  FIX THIS !!

    //  THIS EVENT  'dataUpdated' NO LONGER OCCURS
    //  SO  $scope.uniqueCategories  is not set
    //  SO  $scope.currentData  is not set

    // D3 service instances will emit a 'dataUpdated' event when they fetch new data.
    // We'll store that data in scope here, and that way it will be available to
    // directives and templates as well.
    $rootScope.$on('dataUpdated', function(evt, data) {
      $scope.currentData = data;
      $scope.uniqueCategories = getUniqueCategories(data);
    });


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

    // Create the graph(s) for the view/page.

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

     var temp = "";

     var tempData;

     // commented out because I think this is triggering the watch code
     //
     // $scope.selectedProductType = $scope.productTypesDropDown[0];
     // $scope.selectedDistributor = $scope.distributorsDropDown[0];
     // $scope.selectedCustomer = $scope.customersDropDown[0];
     // $scope.selectedSalesmen = $scope.salesmenDropDown[0];

     // stop updates

     // temporarily commented out for debugging
     // resources.forEach(function(resourceObj){
     //   if (resourceObj.name !== "dropdown"){
     //     if ($scope[resourceObj.name + "Updates"] !== null){
     //       stopUpdates(resourceObj);
     //     }
     //   }
     // });

     if ($scope.currentView === 'overview') {
       console.log('overview page has been loaded into the view.');

       tempData = filterD3Data($scope.customerData, "customer");

       $scope.d3Object = D3('pie', 500, 500, tempData);

       $scope.$watch('selectedSalesmen', watchForDropDownChanges);
       $scope.$watch('selectedCustomer', watchForDropDownChanges);
       $scope.$watch('selectedProductType', watchForDropDownChanges);
       $scope.$watch('selectedDistributor', watchForDropDownChanges);

       temp = 'customer';

     } else if ($scope.currentView === 'customer') {
       console.log('Customer page has been loaded into the view.');

       tempData = filterD3Data($scope.customerData, "customer");

       $scope.d3Object = D3('bar', 800, 500, tempData);

       $scope.$watch('selectedSalesmen', watchForDropDownChanges);
       $scope.$watch('selectedCustomer', watchForDropDownChanges);
       $scope.$watch('selectedProductType', watchForDropDownChanges);
       $scope.$watch('selectedDistributor', watchForDropDownChanges);

       temp = 'customer';

     } else if ($scope.currentView === 'salespeople') {
       console.log('Salespeople page has been loaded into the view.');

       tempData = filterD3Data($scope.salespeopleData, "salespeople");

       $scope.d3Object = D3('stacked-chart', 900, 500, tempData);

       $scope.$watch('selectedSalesmen', watchForDropDownChanges);
       $scope.$watch('selectedCustomer', watchForDropDownChanges);
       $scope.$watch('selectedProductType', watchForDropDownChanges);
       $scope.$watch('selectedDistributor', watchForDropDownChanges);

       temp = 'salespeople';
      }

     // start updates
     // temporarily commented out for debuggin
     // resources.forEach(function(resourceObj){
     //   if (resourceObj.name === temp){
     //      startUpdates(resourceObj);
     //   }
     // });


   });


    // ===========================================================
    //   filterD3Data - filter the data according the the drop down values
    //
    // ===========================================================

    function filterD3Data(data, dataType) {

            var changedData = [];

            console.log("");
            console.log("inside D3 filterD3Data");

            console.log("data");
            console.log(data);
            console.log("");

            console.log("dataType");
            console.log(dataType);


            // console.log("$scope.dropdownvalues");
            // console.log($scope.dropdownvalues);
            // console.log("");
            if ($scope.dropdownvalues === undefined){
              console.log("returning true because $scope.dropdownvalues is null");
              return data;
            }


            // example data   {"Name":"All Door","Value":null}
            // console.log("$scope.dropdownvalues.selectedCustomer");
            // console.log($scope.dropdownvalues.selectedCustomer);

            // console.log("$scope.dropdownvalues.selectedCustomer.Value");
            // if ($scope.dropdownvalues.selectedCustomer && $scope.dropdownvalues.selectedCustomer.Value) {
            //   console.log($scope.dropdownvalues.selectedCustomer.Value);
            // } else {
            //   console.log("undefined or null");
            // }
            // console.log();

            // console.log("$scope.dropdownvalues.selectedSalesmen");
            // console.log($scope.dropdownvalues.selectedSalesmen);

            // console.log("$scope.dropdownvalues.selectedSalesmen.Value");
            // if ($scope.dropdownvalues.selectedSalesmen && $scope.dropdownvalues.selectedSalesmen.Value){
            //   console.log($scope.dropdownvalues.selectedSalesmen.Value);
            // } else {
            //   console.log("undefined or null");
            // }
            // console.log();

            // console.log("$scope.dropdownvalues.selectedDistributor");
            // console.log($scope.dropdownvalues.selectedDistributor);

            // console.log("$scope.dropdownvalues.selectedDistributor.Value");
            // if ($scope.dropdownvalues.selectedDistributor && $scope.dropdownvalues.selectedDistributor.Value){
            //   console.log($scope.dropdownvalues.selectedDistributor.Value);
            // } else {
            //   console.log("undefined or null");
            // }
            // console.log();

            //  filter the data if dropdown contains a Customer or Salesmen or Distributor


            changedData = data.filter(function(element, index, array){

              console.log("element");
              console.log(element);
              console.log("element.Id");
              console.log(element.Id);
              console.log("element.Name");
              console.log(element.Name);

              console.log("dataType");
              console.log(dataType);

            // Is this Quotes, Salespersons, or Customers data ?

            // If its Quotes then filter by Product Type and/or Quote?
            // If its Salespersons then filter by Product Type and/or Salesperson
            // If its Customers then filter by Product Type and/or Customers

            // [
            //   {
            //     "Totals": {
            //       "Interior":2284.81,   <—   DropDowns.Products.Name   filters these
            //       "Exterior":33699.36,
            //       "Window":10477.000,
            //       "Moulding":19.24,
            //       "Siding":273.61,
            //       "Decking":4629.42,
            //       "Skylight":6230.33
            //     },
            //     "Name":"Auto Save",    <—   DropDowns.Customer.Name   filters this
            //     "Id":8
            //   },
            //   {  }
            // ]


            if (!(($scope.dropdownvalues.selectedCustomer && $scope.dropdownvalues.selectedCustomer.Value) ||
                  ($scope.dropdownvalues.selectedSalesmen && $scope.dropdownvalues.selectedSalesmen.Value) ||
                  ($scope.dropdownvalues.selectedDistributor && $scope.dropdownvalues.selectedDistributor.Value))) {
                    console.log("returning because all dropdown values are null or undefined.");
                    return true;
            }

            // Are we filtering  "customer" data or "salesperson" data or "quote" data?

            console.log("got past rejection");

            var customerFilter    = false;
            var salespersonFilter = false;
            var quoteFilter       = false;

            if (dataType === "customer"){
              customerFilter = true;

              console.log("inside customer test");

              if (!$scope.dropdownvalues.selectedCustomer){
                return true;
              }

             if ($scope.dropdownvalues.selectedCustomer["Name"] === "All Customers"){
               return true;
             }


              if ($scope.dropdownvalues.selectedCustomer && $scope.dropdownvalues.selectedCustomer.Value){

                if ($scope.dropdownvalues.selectedCustomer["Value"] === element["Id"]){
                  console.log("return true");
                  return true;
                }

              }
            } else if (dataType === "salespeople"){

              console.log("inside salesperson test");

              salespersonFilter = true;

             console.log("$scope.dropdownvalues.selectedSalesmen");
             console.log($scope.dropdownvalues.selectedSalesmen);
             console.log("$scope.dropdownvalues.selectedSalesmen.Value");
             if ($scope.dropdownvalues.selectedSalesmen && $scope.dropdownvalues.selectedSalesmen.Value){
               console.log($scope.dropdownvalues.selectedSalesmen.Value);
             }
             console.log('element["Id"]');
             console.log(element["Id"]);


             if (!$scope.dropdownvalues.selectedSalesmen){
                return true;
              }

             if ($scope.dropdownvalues.selectedSalesmen["Name"] === "All Salesmen"){
               return true;
             }

              if ($scope.dropdownvalues.selectedSalesmen && $scope.dropdownvalues.selectedSalesmen.Value){

                if ($scope.dropdownvalues.selectedSalesmen["Value"] === element["Id"]){
                  console.log("return true");
                  return true;
                }

              }

            } else if (dataType === "quote"){
              quoteFilter = true;

              return true;
            }

            return false;

        });

        console.log("after Customer, Salesmen filter");
        console.log("changedData");
        console.log(changedData);

        if ( $scope.dropdownvalues &&
             $scope.dropdownvalues.selectedProductType &&
             $scope.dropdownvalues.selectedProductType.Value )
        {
            // filter if the Product Type drop down has a value selected

            console.log("filtering Product Type");
            console.log("============================================");

            changedData = changedData.map(function(element, index, array){

              if ($scope.dropdownvalues === undefined) return element;

              var temp = {};
              var Name;

              // {"Name":"Exterior","Value":98}

              var key = $scope.dropdownvalues.selectedProductType.Name;
              console.log("key = " + key);

              if (element.Totals[key]) {
                temp[key] = element.Totals[key];
              }

              element.Totals = temp;

              return element;

            });  //  changedData = changedData.map(function(element, index, array){
        }

        console.log("data.length = " + data.length);
        console.log("changedData.length = " + changedData.length);
        console.log("");

        console.log("changedData");
        console.log(changedData);
        return changedData;

    }  //  end of   function filterD3Data(data) {


  }]);
};
