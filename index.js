'use strict';

var through = require('through2')
  , resolveSwaps = require('./lib/resolve-swaps')
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
      // remove leading and trailing '/' since creating a RegExp will add those anyhow
      // basically we want to support two formats, just a simple string or a string including '/'s
      // since that makes clear to people reading the package.json that this is a regex
      // We will also only document the format including the '/'
      var stringified = k.replace(/^\/|\/$/g,'');
      var regex = new RegExp(stringified);
      return regex.test(file);
    })
    .map(function (k) { return swaps[k]; });

  // XX: what if we get more than one? For now we just use first match.
  return matches[0];
}

var go = module.exports = function (file) {
  var env = process.env.BROWSERIFY_SWAP
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
    var self = this;

    // if config was cached we already resolved the swapFile if we got here
    if (swapFile) {
      self.push(requireSwap(swapFile));
      return cb();
    }

    resolveSwaps(process.cwd(), function (err, config) {
      // signal with -1 that we already tried to resolve a swap config but didn't find any
      cachedConfig = config || -1;
      if (err) return cb(err);

      swapFile = swap(config, env, file);
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
  process.env.BROWSERIFY_SWAP = 'dev';

  var file = 'node_modules/hyperwatch.js'
    , tx = go(file);

  require('fs').createReadStream(__filename)
    .pipe(tx)
    .pipe(process.stdout);
    

}
