module.exports = function(app) {
  app.filter('quoteFilter', function() {
    return function(input) {
      var inputArray = [];

      for(var item in input) {
        inputArray.push(input[item])
      }

      return inputArray.filter(function(v) {
        return Object.keys(v.Totals).length > 0 ? true : false
      })
    }
  })
}