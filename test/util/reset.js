'use strict';

var rmrf =  require('rimraf')
  , cpr  =  require('cpr')

module.exports = function reset(original, copy, cb) {
  rmrf(copy, function (err) {
    // expecting err since may not exist  
    if (err) return console.error(err);

    cpr(original, copy, cb);
  });
}
