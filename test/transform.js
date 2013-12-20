'use strict';
/*jshint asi: true */

var test = require('tap').test
  , applyTransform = require('apply-transform')
  , swap = require('../')

var process_cwd = process.cwd;

test('\nwhen current dir has package.json with swap config', function (t) {
  var dir = __dirname + '/resolve-swap'
  process.cwd = function () { return dir; }
  process.env.BROWSERIFYSWAP_ENV = 'dev';

  test('\n# and I transform a file that matches swap selector pointing to local file', function (t) {
    var tx = swap('/some/path/node_modules/hyperwatch.js')
    applyTransform(tx, 'var original = this', function (err, res) {
      if (err) { t.fail(err); t.end(); }
      t.equal(res, 'module.exports = require(\'' + dir + '/swap/some-hyperwatch-swap.js\');', 'swaps it out');
      t.end();
    });
  })

  test('\n# and I transform a file that does not match swap selector', function (t) {
    var tx = swap('/some/path/node_modules/not-matching.js')
    applyTransform(tx, 'var original = this', function (err, res) {
      if (err) { t.fail(err); t.end(); }
      t.equal(res, 'var original = this', 'doe not swap it out');
      t.end();
    });
  })

  test('\n# and I transform a file that matches swap selector pointing installed module', function (t) {
    var tx = swap('util.js')
    applyTransform(tx, 'var original = this', function (err, res) {
      if (err) { t.fail(err); t.end(); }
      t.equal(res, 'module.exports = require(\'' + dir + '/node_modules/myutil/index.js\');', 'swaps it out');
      t.end();
    });
  })

  test('\n# and I transform a file that matches swap selector pointing installed module for different environment', function (t) {
    process.env.BROWSERIFYSWAP_ENV = 'test';
    var tx = swap('util.js')
    applyTransform(tx, 'var original = this', function (err, res) {
      if (err) { t.fail(err); t.end(); }
      t.equal(res, 'module.exports = require(\'' + dir + '/node_modules/test-util/index.js\');', 'swaps it out');
      t.end();
    });
  })

  test('\n# and I transform a file that matches swap selector but not in current environment', function (t) {
    process.env.BROWSERIFYSWAP_ENV = 'test';
    var tx = swap('/some/path/node_modules/hyperwatch.js')
    applyTransform(tx, 'var original = this', function (err, res) {
      if (err) { t.fail(err); t.end(); }
      t.equal(res, 'var original = this', 'doe not swap it out');
      t.end();
    });
  })

  process.cwd = process_cwd;
  t.end()
})
