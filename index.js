'use strict';

var through = require('through2')
  , cachedConfig;

function stub(config, file, stream) {

}

var go = module.exports = function (file) {
  var stream = through()
    , env = process.env.BROWSERIFY_STUB;

  // no stubbing desired, just pipe it through
  if (!env) return stream;

  if (cachedConfig) { 
    stub(config, env, file, stream);
  } else {
    resolveConfig(function (err, config) {
      if (err) return stream.emit('error', err);
      cachedConfig = config;
      stub(config, env, file, stream);
    });
  }
  return stream;
};
