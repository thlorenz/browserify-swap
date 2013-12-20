'use strict';

var through = require('through2')
  , resolveSwaps = require('./lib/resolve-swaps')
  , debug = require('./lib/debug')
  , cachedConfig;

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function requireSwap(swapFileName) {
  return 'module.exports = require(\'' + swapFileName + '\');'
}

function swap(config, env, file) {
  if (!config) return;

  var swaps = config[env];

  if (!swaps) return;

  var matches = Object.keys(swaps)
    .filter(function (k) { 
      // Remove leading and trailing '/' since creating a RegExp will add those anyhow.
      // We want to support the /../ format as well just a simple string without the /s.
      // We will only document the format without the '/'.
      var stringified = k.replace(/^\/|\/$/g,'');
      var regex = new RegExp(stringified);
      return regex.test(file);
    })
    .map(function (k) { return swaps[k]; });

  // XX: what if we get more than one? For now we just use first match.
  return matches[0];
}

var go = module.exports = function (file) {
  var env = process.env.BROWSERIFYSWAP_ENV
    , data = ''
    , swapFile;

  // no stubbing desired or we already determined that we can't find a swap config => just pipe it through
  if (!env || cachedConfig === -1) return through();

  if (cachedConfig) {
    swapFile = swap(cachedConfig, env, file);

    // early exit if we have config cached already and know we won't replace anything anyways
    return swapFile ? through(write, end) : through();
  } else {
    return through(write, end)
  }

  function write(d, enc, cb) { data += d; cb(); }
  function end(cb) {
    /*jshint validthis:true */ 
    var self = this;


    // if config was cached we already resolved the swapFile if we got here
    if (swapFile) {
      debug.inspect({ file: file, swapFile: swapFile });
      self.push(requireSwap(swapFile));
      return cb();
    }

    resolveSwaps(process.cwd(), function (err, config) {
      // signal with -1 that we already tried to resolve a swap config but didn't find any
      cachedConfig = config || -1;
      if (err) return cb(err);

      debug.inspect({ swaps: config, env: env });
      swapFile = swap(config, env, file);
      debug.inspect({ file: file, swapFile: swapFile });

      var src = swapFile ? requireSwap(swapFile) : data;
      self.push(src);
      cb();
    });
  }
}

// Test
if (!module.parent && typeof window === 'undefined') {
  process.cwd = function () {
    return __dirname + '/test/resolve-swap';
  }
  process.env.BROWSERIFYSWAP_ENV = 'dev';

  var file = 'node_modules/hyperwatch.js'
    , tx = go(file);

  require('fs').createReadStream(__filename)
    .pipe(tx)
    .pipe(process.stdout);
    

}
