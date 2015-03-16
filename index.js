'use strict';

var through      =  require('through2')
  , resolveSwaps =  require('./lib/resolve-swaps')
  , debug        =  require('./lib/debug')
  , viralify     =  require('viralify')
  , cachedConfig

var root = process.env.BROWSERIFYSWAP_ROOT || process.cwd();

function viralifyDeps(packages) {
  debug.inspect({ action: 'viralify', root: root, packages: packages });
  try {
    viralify.sync(root, packages, 'browserify-swap', true);
  } catch (err) {
    debug(err.stack);
  }
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

var go = module.exports =

/**
 * Looks up browserify_swap configuratios specified for the given file in the environment specified via `BROWSERIFYSWAP_ENV`.
 *
 * If found the file content is replaced with a require statement to the file to swap in for the original.
 * Otherwise the file's content is just piped through.
 *
 * @name browserifySwap
 * @function
 * @param {String} file full path to file being transformed
 * @return {TransformStream} transform stream into which `browserify` will pipe the original content of the file
 */
function browserifySwap(file) {
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
      swapFile = swapFile.replace(/\\/g, '/');
      debug.inspect({ file: file, swapFile: swapFile });
      self.push(requireSwap(swapFile));
      return cb();
    }

    // we should only get here the very first time that this transform is invoked
    resolveSwaps(root, function (err, config) {
      if (config && config.packages) viralifyDeps(config.packages);
      var swaps = config && config.swaps;

      // signal with -1 that we already tried to resolve a swap config but didn't find any
      cachedConfig = swaps || -1;

      if (err) return cb(err);

      debug.inspect({ swaps: swaps, env: env });
      swapFile = swap(swaps, env, file);
      debug.inspect({ file: file, swapFile: swapFile });

      var src = swapFile ? requireSwap(swapFile.replace(/\\/g, '/')) : data;
      self.push(src);
      cb();
    });
  }
}

// Test
function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

if (!module.parent && typeof window === 'undefined') {
  var pack = require('./test/resolve-swap/package.json');
  inspect(pack);
}
