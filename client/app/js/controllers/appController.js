'use strict';

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
    // $scope.currentData;
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
    var quoteResource       = Resource('./data/ordersByQuote.json');
    var dropDownResource    = Resource('./data/dropDownContent.json');

    var resources = [];
    resources.push({  name: "salespeople", resource: salespeopleResource, updateInterval: 6000000});
    resources.push({  name: "customer",    resource: customerResource,    updateInterval: 6000000});
    resources.push({  name: "dropdown",    resource: dropDownResource,    updateInterval: 6000000});
    resources.push({  name: "quote",       resource: quoteResource,       updateInterval: 6000000});

    // ===========================================================
    //   startUpdates  -  get data from the server every updateInterval milliseconds
    //                 -  store data on $scope
    //
    // called from js/controllers/appController.js
    //
    // ===========================================================
    function startUpdates(resourceObj) {
      $scope[resourceObj.name + "Updates"] = setInterval(function() {
        resourceObj.resource.get(function(err, data) {
          $scope[resourceObj.name + "Data"] = data;
        });
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
      resources.forEach(function(resourceObj){
        resourceObj.resource.get(function(err, data) {
          // emit an event up the scope chain with the newly fetched data
          $rootScope.$emit('dataUpdated', data);
          $scope[resourceObj.name + "Data"] = data;
          if (resourceObj.name === "dropdown"){
            // remove "s" from the end of all Product Type Names
            data.DropDowns.Products = data.DropDowns.Products.map(function(element){
              return element;
            });
            $scope.productTypesDropDown = data.DropDowns.Products;
            $scope.distributorsDropDown = data.DropDowns.Distributors;
            $scope.customersDropDown    = data.DropDowns.Customers;
            $scope.salesmenDropDown     = data.DropDowns.Salesmen;
          }  //  if (resourceObj.name === "dropdown")
        });
      });
    }

    getDataFromServer();

    // =======================================================================
    //
    //  Deep copy an Object
    //
    // =======================================================================
    function deepCopyObject(itemObj){
      var temp = {};
      for (var property in itemObj) {
        if (itemObj.hasOwnProperty(property)) {
          if (typeof itemObj[property] === "object"){
            temp[property] = deepCopyObject(itemObj[property]);
          } else {
            temp[property] = itemObj[property];
          }
        }
      }
      return temp;
    }

    // =======================================================================
    //
    //  Deep copy an array of Objects
    //
    // =======================================================================
    function deepCopyArray(myArray){
      var tempArray = myArray.map(function(itemObj){
        return deepCopyObject(itemObj);
      });
      return tempArray;
    }

    // =======================================================================
    //
    //  Watch for Drop Down Changes
    //
    // =======================================================================
    function watchForDropDownChanges(){
      var temp;
      var tempData;
      var dropdownvalues = {};
      dropdownvalues.selectedSalesmen     = $scope.selectedSalesmen;
      dropdownvalues.selectedCustomer     = $scope.selectedCustomer;
      dropdownvalues.selectedProductType  = $scope.selectedProductType;
      dropdownvalues.selectedDistributor  = $scope.selectedDistributor;

      $scope.dropdownvalues = dropdownvalues;

      if (!(dropdownvalues.selectedSalesmen    === undefined &&
        dropdownvalues.selectedCustomer    === undefined &&
        dropdownvalues.selectedProductType === undefined &&
        dropdownvalues.selectedDistributor === undefined  )) {
          if ($scope.currentView === 'overview'){

            // stop updates

            resources.forEach(function(resourceObj){
              if (resourceObj.name === "customer"){
                if ($scope[resourceObj.name + "Updates"] !== null){
                  stopUpdates(resourceObj);
                }
              }
            });

            // copy $scope.customerData to another array
            // ... because, somehow, function filterD3Data()
            // ...... is changing $scope.customerData

            tempData = deepCopyArray($scope.customerData);

            temp = filterD3Data(tempData, "customer");

            if ($scope.d3Object) {
              $scope.d3Object.buildChart(temp);
            } else {
              $scope.d3Object = D3('pie', 500, 500, temp);
            }

            // start updates

            resources.forEach(function(resourceObj){
              if (resourceObj.name === "customer"){
                startUpdates(resourceObj);
              }
            });

          } else if ($scope.currentView === 'customer'){

            // stop updates

            resources.forEach(function(resourceObj){
              if (resourceObj.name === "customer"){
                if ($scope[resourceObj.name + "Updates"] !== null){
                  stopUpdates(resourceObj);
                }
              }
            });

            // copy $scope.customerData to another array
            // ... because, somehow, function filterD3Data()
            // ...... is changing $scope.customerData

            tempData = deepCopyArray($scope.customerData);

            temp = filterD3Data(tempData, "customer");

            if ($scope.d3Object) {
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


            // stop updates

            // temporarily commenting out
            // resources.forEach(function(resourceObj){
            //   if (resourceObj.name === "salespeople"){
            //     if ($scope[resourceObj.name + "Updates"] !== null){
            //       stopUpdates(resourceObj);
            //     }
            //   }
            // });

            // deep copy $scope.customerData to another array
            // ... because, somehow, function filterD3Data()
            // ...... is changing $scope.salespeopleData

            tempData = deepCopyArray($scope.salespeopleData);

            temp = filterD3Data(tempData, "salespeople");

            if ($scope.d3Object) {
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

      // Create the graph(s) for the view/page.

      $scope.d3Object = null;
      $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
        if (toState.name === 'overview') {
          $scope.currentView = 'overview';
        } else if (toState.name === 'customer') {
          $scope.currentView = 'customer';
        } else if (toState.name === 'salespeople') {
          $scope.currentView = 'salespeople';
        }
      });
      $scope.$on('$viewContentLoaded', function(){

        var temp = "";
        var tempData;
        var filteredTempData;

        // stop updates

        // temporarily commented out for debugging
        resources.forEach(function(resourceObj){
          if (resourceObj.name !== "dropdown"){
            if ($scope[resourceObj.name + "Updates"] !== null){
              stopUpdates(resourceObj);
            }
          }
        });

        if ($scope.currentView === 'overview') {

          // deep copy $scope.customerData to another array
          // ... because, somehow, function filterD3Data()
          // ...... is changing $scope.customerData

          tempData = deepCopyArray($scope.customerData);

          filteredTempData = filterD3Data(tempData, "customer");

          $scope.d3Object = D3('pie', 500, 500, filteredTempData);

          $scope.$watch('selectedSalesmen', watchForDropDownChanges);
          $scope.$watch('selectedCustomer', watchForDropDownChanges);
          $scope.$watch('selectedProductType', watchForDropDownChanges);
          $scope.$watch('selectedDistributor', watchForDropDownChanges);

          temp = 'customer';

        } else if ($scope.currentView === 'customer') {

          // deep copy $scope.customerData to another array
          // ... because, somehow, function filterD3Data()
          // ...... is changing $scope.customerData

          tempData = deepCopyArray($scope.customerData);

          filteredTempData = filterD3Data(tempData, "customer");

          $scope.d3Object = D3('bar', 800, 500, filteredTempData);

          $scope.$watch('selectedSalesmen', watchForDropDownChanges);
          $scope.$watch('selectedCustomer', watchForDropDownChanges);
          $scope.$watch('selectedProductType', watchForDropDownChanges);
          $scope.$watch('selectedDistributor', watchForDropDownChanges);

          temp = 'customer';

        } else if ($scope.currentView === 'salespeople') {

          // deep copy $scope.customerData to another array
          // ... because, somehow, function filterD3Data()
          // ...... is changing $scope.salespeopleData

          tempData = deepCopyArray($scope.salespeopleData);

          filteredTempData = filterD3Data(tempData, "salespeople");

          $scope.d3Object = D3('stacked-chart', 900, 500, filteredTempData);

          $scope.$watch('selectedSalesmen', watchForDropDownChanges);
          $scope.$watch('selectedCustomer', watchForDropDownChanges);
          $scope.$watch('selectedProductType', watchForDropDownChanges);
          $scope.$watch('selectedDistributor', watchForDropDownChanges);

          temp = 'salespeople';
        }

        // start updates
        // temporarily commented out for debuggin
        resources.forEach(function(resourceObj){
          if (resourceObj.name === temp){
            startUpdates(resourceObj);
          }
        });


      });


      // ===========================================================
      //   filterD3Data - filter the data according the the drop down values
      //
      // ===========================================================

      function filterD3Data(data, dataType) {

        var changedData = [];

        // =====================================================
        //  copy data array
        //  ... because having trouble with passing by reference
        // =====================================================

        var copyOfData = data.map(function(item){
          return item;
        });

        if ($scope.dropdownvalues === undefined){
          return copyOfData;
        }

        // =====================================================================
        //   filter data for the  Customer, Salesmen and Distributor dropdowns
        //
        //   ... skip the filtering if nothing is selected in the dropdowns
        //
        // =====================================================================

        if (($scope.dropdownvalues.selectedCustomer && $scope.dropdownvalues.selectedCustomer.Value) ||
        ($scope.dropdownvalues.selectedSalesmen && $scope.dropdownvalues.selectedSalesmen.Value) ||
        ($scope.dropdownvalues.selectedDistributor && $scope.dropdownvalues.selectedDistributor.Value)) {


          // =====================================================================
          //   filter data for the  Customer, Salesmen and Distributor dropdowns
          // =====================================================================
          changedData = copyOfData.filter(function(element, index, array){

            // Is this Quotes, Salespersons, or Customers data ?

            // If its Quotes then       filter by Product Type and/or Quote?
            // If its Salespersons then filter by Product Type and/or Salesperson
            // If its Customers then    filter by Product Type and/or Customers

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


            if (dataType === "customer"){

              if (!$scope.dropdownvalues.selectedCustomer){
                return true;
              }

              if ($scope.dropdownvalues.selectedCustomer["Name"] === "All Customers"){
                return true;
              }

              if ($scope.dropdownvalues.selectedCustomer && $scope.dropdownvalues.selectedCustomer.Value){
                if ($scope.dropdownvalues.selectedCustomer["Value"] === element["Id"]){
                  return true;
                }
              }
            } else if (dataType === "salespeople"){

              if (!$scope.dropdownvalues.selectedSalesmen){
                return true;
              }

              if ($scope.dropdownvalues.selectedSalesmen["Name"] === "All Salesmen"){
                return true;
              }

              if ($scope.dropdownvalues.selectedSalesmen && $scope.dropdownvalues.selectedSalesmen.Value){

                if ($scope.dropdownvalues.selectedSalesmen["Value"] === element["Id"]){
                  return true;
                }
              }
            } else if (dataType === "quote"){

              return true;
            }
            return false;
          });   // end of   data.filter(function(element, index, array)
        } else {

          // no filtering of original data
          changedData = copyOfData;

        }  // end of if( )

        // =====================================================================
        //
        //   end of filter data for the  Customer, Salesmen and Distributor dropdowns
        //
        // =====================================================================


        // =====================================================================
        //   filter data for the  Product Type dropdowns
        // =====================================================================

        if ( $scope.dropdownvalues && $scope.dropdownvalues.selectedProductType && $scope.dropdownvalues.selectedProductType.Value ) {

          // =====================================================================
          //   filter data for the  Product Type dropdowns
          // =====================================================================
          var changedData_2 = changedData.map(function(element, index, array){

            var temp = {};

            // example Product Type selected value {"Name":"Exterior","Value":98}

            // match selected Product Type to Customer or Salesmen data
            // ... using Product Type Name  not  Id

            var Name = $scope.dropdownvalues.selectedProductType.Name;

            if (element.Totals[Name]) {
              temp[Name] = element.Totals[Name];
            }

            element.Totals = temp;

            return element;

          });  //  changedData_2 = changedData.map(function(element, index, array)

          changedData = changedData_2;
        }

        // =====================================================================
        //   end of     filter data for the  Product Type dropdowns
        // =====================================================================

        return changedData;
      }  //  end of   function filterD3Data(data)
  }]);
};
