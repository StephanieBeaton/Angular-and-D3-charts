'use strict';
module.exports = exports = function(res, err, code, message) {
  return res.status(code).send(message.toString());
};
