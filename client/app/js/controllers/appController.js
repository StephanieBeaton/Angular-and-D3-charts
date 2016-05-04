'use strict'

module.exports = exports = function(app) {

  app.controller('appController', ['$rootScope', '$scope', '$location', '$http', 'Resource', 'D3', 'spinnerService', 'localStorageService',
  function($rootScope, $scope, $location, $http, Resource, D3, spinnerService, localStorageService) {

    $scope.d3Object
    $scope.d3Pie
    $scope.d3Bar
    $scope.d3Stack

    $scope.currentView = $location.path().slice(1)

    // TODO: This should be gotten from the server for each user
    var userKey = "EP65g4K-8Fg67"

    var overviewResource = null

    $scope.salespeopleResource = Resource('http://fasterbids.com/DataAccess/getordersbysalesperson?USERkey=' + userKey)
    $scope.customerResource = Resource('http://fasterbids.com/DataAccess/getordersbycustomer?USERkey=' + userKey)
    $scope.quoteResource = Resource('http://fasterbids.com/DataAccess/getordersbyquote?USERkey=' + userKey)
    $scope.dropDownResource = Resource('http://fasterbids.com/DataAccess/GetPageDropDowns?USERkey=' + userKey)

    var resources = {}

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

    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
      $scope.d3Object = null
      if (toState.name === 'overview') {
        $scope.currentView = 'overview'
        $scope.d3Object = $scope.d3Pie
      } else if (toState.name === 'customer') {
        $scope.currentView = 'customer'
        $scope.d3Object = $scope.d3Bar
      } else if (toState.name === 'salespeople') {
        $scope.currentView = 'salespeople'
        $scope.d3Object = $scope.d3Stack
      }
    })

    $rootScope.$on('ajaxContentLoaded', drawWatch)
    $rootScope.$on('$viewContentLoaded', drawWatch)

    function drawWatch() {
      var temp = ""
      var tempData
      var filteredTempData

      if ($scope.currentView === 'overview') {
        tempData = deepCopyArray($scope.customerData)

        filteredTempData = filterD3Data(tempData, "customer")

        $scope.d3Pie = $scope.d3Pie || D3('pie', 500, 500, filteredTempData)
        $scope.d3Object = $scope.d3Pie

        $scope.$watch('selectedSalesmen', watchForDropDownChanges)
        $scope.$watch('selectedCustomer', watchForDropDownChanges)
        $scope.$watch('selectedProductType', watchForDropDownChanges)
        $scope.$watch('selectedDistributor', watchForDropDownChanges)

      } else if ($scope.currentView === 'customer') {

        tempData = deepCopyArray($scope.customerData)

        filteredTempData = filterD3Data(tempData, "customer")

        $scope.d3Bar = $scope.d3Bar || D3('bar', 800, 500, filteredTempData)
        $scope.d3Object = $scope.d3Bar

        $scope.$watch('selectedSalesmen', watchForDropDownChanges)
        $scope.$watch('selectedCustomer', watchForDropDownChanges)
        $scope.$watch('selectedProductType', watchForDropDownChanges)
        $scope.$watch('selectedDistributor', watchForDropDownChanges)

      } else if ($scope.currentView === 'salespeople') {

        tempData = deepCopyArray($scope.salespeopleData)

        filteredTempData = filterD3Data(tempData, "salespeople")

        $scope.d3Stack = $scope.d3Stack || D3('stacked-chart', 900, 500, filteredTempData)
        $scope.d3Object = $scope.d3Stack

        $scope.$watch('selectedSalesmen', watchForDropDownChanges)
        $scope.$watch('selectedCustomer', watchForDropDownChanges)
        $scope.$watch('selectedProductType', watchForDropDownChanges)
        $scope.$watch('selectedDistributor', watchForDropDownChanges)
      }
    }

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

      if(localStorageService.keys().length === 4) {
        $scope.quoteData = localStorageService.get('quoteData')
        $rootScope.$emit('quotesUpdated', $scope.quoteData)
        loaded.quote = true

        $scope.salespeopleData = localStorageService.get('salespeopleData')
        $rootScope.$emit('salespeopleUpdated', $scope.salespeopleData)
        loaded.sales = true

        $scope.customerData = localStorageService.get('customerData')
        $rootScope.$emit('customersUpdated', $scope.customerData)
        loaded.custo = true

        $scope.dropDownData = localStorageService.get('dropDownData')
        $rootScope.$emit('dropDownsUpdated', $scope.dropDownData)
        loaded.drops = true

        $scope.productTypesDropDown = $scope.dropDownData.DropDowns.Products
        $scope.distributorsDropDown = $scope.dropDownData.DropDowns.Distributors
        $scope.customersDropDown    = $scope.dropDownData.DropDowns.Customers
        $scope.salesmenDropDown     = $scope.dropDownData.DropDowns.Salesmen

        $rootScope.$emit('ajaxContentLoaded')
        return
      } else {
        $scope.quoteResource.get(
          function(err, res) {
            if(err) errors.push(err)
            if(res) {
              $scope.quoteData = res
              localStorageService.set('quoteData', res)
            }
            $rootScope.$emit('quotesUpdated', res)
            loaded.quote = true
          }
        )

        $scope.salespeopleResource.get(
          function(err, res) {
            if(err) errors.push(err)
            if(res) {
              $scope.salespeopleData = res
              localStorageService.set('salespeopleData', res)
            }
            $rootScope.$emit('salespeopleUpdated', res)
            loaded.sales = true
          }
        )

        $scope.customerResource.get(
          function(err, res) {
            if(err) errors.push(err)
            if(res) {
              $scope.customerData = res
              localStorageService.set('customerData', res)
            }
            $rootScope.$emit('customersUpdated', res)
            loaded.custo = true
          }
        )

        $scope.dropDownResource.get(
          function(err, res) {
            if(err) errors.push(err)
            if(res) {
              $scope.dropDownData = res
              localStorageService.set('dropDownData', res)
            }
            $rootScope.$emit('dropDownsUpdated', res)
            loaded.drops = true
          }
        )

        function wait() {
          if (!(loaded.quote && loaded.sales && loaded.custo && loaded.drops)) {
            setTimeout(wait, 500)
          } else {
            $scope.productTypesDropDown = $scope.dropDownData.DropDowns.Products
            $scope.distributorsDropDown = $scope.dropDownData.DropDowns.Distributors
            $scope.customersDropDown    = $scope.dropDownData.DropDowns.Customers
            $scope.salesmenDropDown     = $scope.dropDownData.DropDowns.Salesmen

            $rootScope.$emit('ajaxContentLoaded')
          }
        }
        wait()
      }
    }

    getDataFromServer()

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

      if ($scope.currentView === 'overview') {
        startUpdates(resources.customer)

        tempData = deepCopyArray($scope.customerData)
        temp = filterD3Data(tempData, "customer")

        if ($scope.d3Pie) {
          $scope.d3Object = $scope.d3Pie
          $scope.d3Object.buildChart(temp)
        } else {
          $scope.d3Pie = $scope.d3Object = D3('pie', 500, 500, temp)
        }

      } else if ($scope.currentView === 'customer') {
        startUpdates(resources.customer)

        tempData = deepCopyArray($scope.customerData)
        temp = filterD3Data(tempData, "customer")

        if ($scope.d3Bar) {
          $scope.d3Object = $scope.d3Bar
          $scope.d3Object.buildChart(temp)
        } else {
          $scope.d3Bar = $scope.d3Object = D3('bar', 800, 500, temp)
        }
      } else if($scope.currentView === 'salespeople') {
        startUpdates(resources.salespeople)

        tempData = deepCopyArray($scope.salespeopleData)
        temp = filterD3Data(tempData, "salespeople")

        if ($scope.d3Stack) {
          $scope.d3Object = $scope.d3Stack
          $scope.d3Object.buildChart(temp)
        } else {
          $scope.d3Stack = $scope.d3Object = D3('stacked-chart', 900, 500, temp)
        }
      }
    }

    $scope.uniqueCategories = (function() {
      var uniqueCategories = [],
          seenCategories = {}

      $scope.dropDownData.DropDowns.Products.forEach(function(item) {
        if (!seenCategories.hasOwnProperty(item.Name)) {
          uniqueCategories.push(item.Name)
          seenCategories[item.Name] = true
        }
      })

      return uniqueCategories
    })()

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
