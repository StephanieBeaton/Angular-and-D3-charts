'use strict'

module.exports = exports = function(app) {

  app.controller('appController', ['$rootScope', '$scope', '$http', 'Resource', 'D3', function($rootScope, $scope, $http, Resource, D3) {

    // TODO: This should be gotten from the server for each user
    var userKey = "EP65g4K-8Fg67"

    function init() {
      getDataFromServer()
    }

    var overviewResource = null

    $scope.salespeopleResource = Resource('http://fasterbids.com/DataAccess/getordersbysalesperson?USERkey=' + userKey)
    $scope.customerResource = Resource('http://fasterbids.com/DataAccess/getordersbycustomer?USERkey=' + userKey)
    $scope.quoteResource = Resource('http://fasterbids.com/DataAccess/getordersbyquote?USERkey=' + userKey)
    $scope.dropDownResource = Resource('http://fasterbids.com/DataAccess/GetPageDropDowns?USERkey=' + userKey)

    var resources = {}

    function startUpdates(resourceObj) {
      $scope[resourceObj.name + "Updates"] = setInterval(function() {
        resourceObj.get(function(err, data) {
          $scope[resourceObj.name + "Data"] = data
        })
      }, resourceObj.updateInterval)
    }

    function stopUpdates(updater) {
      if (typeof updater !== 'undefined') clearInterval(updater)
    }

    function getDataFromServer() {
      var loaded = {
        quote: false,
        sales: false,
        custo: false,
        drops: false
      }

      var errors = []

      $scope.quoteResource.get(
        function(err, res) {
          if(err) errors.push(err)
          if(res) $scope.quoteData = res
          $rootScope.$emit('dataUpdated', res)
          loaded.quote = true
        }
      )

      $scope.salespeopleResource.get(
        function(err, res) {
          if(err) errors.push(err)
          if(res) $scope.salespeopleData = res
          $rootScope.$emit('dataUpdated', res)
          loaded.sales = true
        }
      )

      $scope.customerResource.get(
        function(err, res) {
          if(err) errors.push(err)
          if(res) $scope.customerData = res
          $rootScope.$emit('dataUpdated', res)
          loaded.custo = true
        }
      )

      $scope.dropDownResource.get(
        function(err, res) {
          if(err) errors.push(err)
          if(res) $scope.dropDownData = res
          $rootScope.$emit('dataUpdated', res)
          loaded.drops = true
        }
      )

      function wait() {
        if (!(loaded.quote && loaded.sales && loaded.custo && loaded.drops)) {
          setTimeout(wait, 500)
        } else {
          resources.salespeople = {
            name: "salespeople",
            resource: $scope.salespeopleResource,
            updateInterval: 6000000
          }
          resources.customer = {
            name: "customer",
            resource: $scope.customerResource,
            updateInterval: 6000000
          }
          resources.dropdown = {
            name: "dropdown",
            resource: $scope.dropDownResource,
            updateInterval: 6000000
          }
          resources.quote = {
            name: "quote",
            resource: $scope.quoteResource,
            updateInterval: 6000000
          }

          $scope.productTypesDropDown = $scope.dropDownData.DropDowns.Products
          $scope.distributorsDropDown = $scope.dropDownData.DropDowns.Distributors
          $scope.customersDropDown    = $scope.dropDownData.DropDowns.Customers
          $scope.salesmenDropDown     = $scope.dropDownData.DropDowns.Salesmen

          $scope.$emit('$viewContentLoaded')
        }
      }
      wait()
    }
    init()

    function deepCopyObject(itemObj) {
      var temp = {}
      for (var property in itemObj) {
        if (itemObj.hasOwnProperty(property)) {
          if (typeof itemObj[property] === "object"){
            temp[property] = deepCopyObject(itemObj[property])
          } else {
            temp[property] = itemObj[property]
          }
        }
      }
      return temp
    }

    function deepCopyArray(myArray) {
      var tempArray = myArray.map(function(itemObj) {
        return deepCopyObject(itemObj)
      })
      return tempArray
    }

    function watchForDropDownChanges() {
      var temp
      var tempData
      var dropdownvalues = {}
      dropdownvalues.selectedSalesmen     = $scope.selectedSalesmen
      dropdownvalues.selectedCustomer     = $scope.selectedCustomer
      dropdownvalues.selectedProductType  = $scope.selectedProductType
      dropdownvalues.selectedDistributor  = $scope.selectedDistributor

      $scope.dropdownvalues = dropdownvalues

      if (!(dropdownvalues.selectedSalesmen   === undefined &&
          dropdownvalues.selectedCustomer     === undefined &&
          dropdownvalues.selectedProductType  === undefined &&
          dropdownvalues.selectedDistributor  === undefined )) {
        if ($scope.currentView === 'overview') {
          startUpdates(resources.customer)

          if ($scope.customerUpdates !== null) {
            stopUpdates($scope.customerUpdates)
          }

          tempData = deepCopyArray($scope.customerData)
          temp = filterD3Data(tempData, "customer")

          if ($scope.d3Object) {
            $scope.d3Object.buildChart(temp)
          } else {
            $scope.d3Object = D3('pie', 500, 500, temp)
          }

        } else if ($scope.currentView === 'customer') {
          startUpdates(resources.customer)

          if ($scope.customerUpdates !== null) {
            stopUpdates($scope.customerUpdates)
          }

          tempData = deepCopyArray($scope.customerData)
          temp = filterD3Data(tempData, "customer")

          if ($scope.d3Object) {
            $scope.d3Object.buildChart(temp)
          } else {
            $scope.d3Object = D3('bar', 800, 500, temp)
          }
        } else {
          startUpdates(resources.salespeople)


          tempData = deepCopyArray($scope.salespeopleData)
          temp = filterD3Data(tempData, "salespeople")

          if ($scope.d3Object) {
            $scope.d3Object.buildChart(temp)
          } else {
            $scope.d3Object = D3('stacked-chart', 900, 500, temp)
          }

          if ($scope.salespeopleUpdates !== null){
            stopUpdates($scope.salespeopleUpdates)
          }
        }
      }
    }

    var getUniqueCategories = function(data) {
      var uniqueCategories = [],
          seenCategories = {}

      if(Array.isArray(data)) {
        data.forEach(function(item) {
          Object.keys(item.Totals).forEach(function(key) {
            if (!seenCategories.hasOwnProperty(key)) {
              uniqueCategories.push(key)
              seenCategories[key] = true
            }
          })
        })
      }

      return uniqueCategories
    }

    $rootScope.$on('dataUpdated', function(evt, data) {
      $scope.currentData = data;
      $scope.uniqueCategories = getUniqueCategories(data);
    });

    $scope.d3Object = null

    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
      if (toState.name === 'overview') {
        $scope.currentView = 'overview'
      } else if (toState.name === 'customer') {
        $scope.currentView = 'customer'
      } else if (toState.name === 'salespeople') {
        $scope.currentView = 'salespeople'
      }
    })

    $scope.$on('$viewContentLoaded', function(){
      var temp = ""
      var tempData
      var filteredTempData

      if ($scope.salespeopleUpdates !== null) stopUpdates($scope.salespeopleUpdates)
      if ($scope.customerUpdates !== null) stopUpdates($scope.customerUpdates)

      if ($scope.currentView === 'overview') {
        tempData = deepCopyArray($scope.customerData)

        filteredTempData = filterD3Data(tempData, "customer")

        $scope.d3Object = D3('pie', 500, 500, filteredTempData)

        $scope.$watch('selectedSalesmen', watchForDropDownChanges)
        $scope.$watch('selectedCustomer', watchForDropDownChanges)
        $scope.$watch('selectedProductType', watchForDropDownChanges)
        $scope.$watch('selectedDistributor', watchForDropDownChanges)

        temp = 'customer'

      } else if ($scope.currentView === 'customer') {

        tempData = deepCopyArray($scope.customerData)

        filteredTempData = filterD3Data(tempData, "customer")

        $scope.d3Object = D3('bar', 800, 500, filteredTempData)

        $scope.$watch('selectedSalesmen', watchForDropDownChanges)
        $scope.$watch('selectedCustomer', watchForDropDownChanges)
        $scope.$watch('selectedProductType', watchForDropDownChanges)
        $scope.$watch('selectedDistributor', watchForDropDownChanges)

        temp = 'customer'

      } else if ($scope.currentView === 'salespeople') {

        tempData = deepCopyArray($scope.salespeopleData)

        filteredTempData = filterD3Data(tempData, "salespeople")

        $scope.d3Object = D3('stacked-chart', 900, 500, filteredTempData)

        $scope.$watch('selectedSalesmen', watchForDropDownChanges)
        $scope.$watch('selectedCustomer', watchForDropDownChanges)
        $scope.$watch('selectedProductType', watchForDropDownChanges)
        $scope.$watch('selectedDistributor', watchForDropDownChanges)

        temp = 'salespeople'
      }
    })

    function filterD3Data(data, dataType) {
      var changedData = []

      var copyOfData = data.map(function(item) {
        return item
      })

      if ($scope.dropdownvalues === undefined) {
        return copyOfData
      }

      if (($scope.dropdownvalues.selectedCustomer && $scope.dropdownvalues.selectedCustomer.Value) ||
          ($scope.dropdownvalues.selectedSalesmen && $scope.dropdownvalues.selectedSalesmen.Value) ||
          ($scope.dropdownvalues.selectedDistributor && $scope.dropdownvalues.selectedDistributor.Value)) {
        changedData = copyOfData.filter(function(element, index, array) {
          if (dataType === "customer") {
            if (!$scope.dropdownvalues.selectedCustomer) {
              return true
            }
            if ($scope.dropdownvalues.selectedCustomer["Name"] === "All Customers") {
              return true
            }
            if ($scope.dropdownvalues.selectedCustomer && $scope.dropdownvalues.selectedCustomer.Value) {
              if ($scope.dropdownvalues.selectedCustomer["Value"] === element["Id"]) {
                return true
              }
            }
          } else if (dataType === "salespeople") {
            if (!$scope.dropdownvalues.selectedSalesmen) {
              return true
            }
            if ($scope.dropdownvalues.selectedSalesmen["Name"] === "All Salesmen") {
              return true
            }
            if ($scope.dropdownvalues.selectedSalesmen && $scope.dropdownvalues.selectedSalesmen.Value) {
              if ($scope.dropdownvalues.selectedSalesmen["Value"] === element["Id"]) {
                return true
              }
            }
          } else if (dataType === "quote") {
            return true
          }
          return false
        })
      } else {
        changedData = copyOfData
      }

      if ($scope.dropdownvalues &&
          $scope.dropdownvalues.selectedProductType &&
          $scope.dropdownvalues.selectedProductType.Value) {
        var changedData_2 = changedData.map(function(element, index, array) {
          var temp = {},
              Name = $scope.dropdownvalues.selectedProductType.Name
          if (element.Totals[Name]) {
            temp[Name] = element.Totals[Name]
          }
          element.Totals = temp
          return element
        })
        changedData = changedData_2
      }
      return changedData
    }
  }])
}
