module.exports = function(app) {
  app.filter('quoteFilter', function() {
    // Checks input set of quotes and returns just those with something in
    // the 'Totals' object (no empty Totals)
    return function(input) {
      var inputArray = [];

      for(var item in input) {
        inputArray.push(input[item])
      }

      return inputArray.filter(function(v) {
        return Object.keys(v.Totals).length > 0
      })
    }
  })
}