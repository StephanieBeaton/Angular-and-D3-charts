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
        var totalSum = 0
        var keyArr = Object.keys(v.Totals)

        for(var key in keyArr) {
          totalSum += v.Totals[keyArr[key]]
        }

        return totalSum > 0
      })
    }
  })
}