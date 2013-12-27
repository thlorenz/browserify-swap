'use strict';

var test = require('tap').test
  , resolve = require('../lib/resolve-swaps')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\nwhen resolving swaps from a dir with package.json that has no swaps', function (t) {
  var dir = __dirname + '/resolve-noswap';
  resolve(dir, function (err, res) {
    if (err) return (t.fail(err), t.end());
    t.notOk(res.swaps, 'returns no swaps')
    t.end()
  });
})

test('\nwhen resolving swaps from a dir with package.json that has swaps', function (t) {
  var dir = __dirname + '/resolve-swap';
  resolve(dir, function (err, res) {
    if (err) return (t.fail(err), t.end());
    t.deepEqual(
        res.swaps
      , { dev:
          { '.*node_modules/hyperwatch/\\S+\\.js$': dir + '/swap/some-hyperwatch-swap.js',
            'util.js$': dir + '/node_modules/myutil/index.js' },
          test: { 'util.js$': dir + '/node_modules/test-util/index.js' } }
      , 'returns swap config with full path of local files and node_modules resolved'
    )
    t.end()
  });
})

test('\nwhen resolving swaps from a dir right below package.json that has swaps', function (t) {
  var root = __dirname + '/resolve-swap'
    , dir = root + '/swap';

  resolve(dir, function (err, res) {
    if (err) return (t.fail(err), t.end());
    t.deepEqual(
          res.swaps
        , { dev:
            { '.*node_modules/hyperwatch/\\S+\\.js$': root + '/swap/some-hyperwatch-swap.js',
              'util.js$': root + '/node_modules/myutil/index.js' },
            test: { 'util.js$': root + '/node_modules/test-util/index.js' } }
      , 'returns swap config with full path of local files and node_modules resolved'
    )
    t.end()
  });
})
