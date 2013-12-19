'use strict';

var through = require('through2')
  , resolveSwaps = require('./lib/resolve-swaps')
  , cachedConfig;

function stub(config, file, stream) {

}

var go = module.exports = function (file) {
  var stream = through()
    , env = process.env.BROWSERIFY_STUB;

  // no stubbing desired or we already determined that we can't find a swap config => just pipe it through
  if (!env || cachedConfig === -1) return stream;

  if (cachedConfig) { 
    stub(cachedConfig, env, file, stream);
  } else {
    resolveSwaps(process.cwd(), function (err, config) {
      // signal with -1 that we already tried to resolve a swap config but didn't find any
      cachedConfig = config || -1;

      if (err) return stream.emit('error', err);
      if (config) stub(config, env, file, stream);
    });
  }

  return stream;
};
