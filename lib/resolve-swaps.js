'use strict';

var findParentDir = require('find-parent-dir')
  , path = require('path')
  , resolve = require('resolve');

function isPath(s) {
  return (/^[.]{0,2}[/\\]/).test(s);
}

function resolvePaths(swaps, root) {
  if (!swaps) return swaps;
  Object.keys(swaps)
    .forEach(function (env) {
      var swap = swaps[env];

      Object.keys(swap)
        .forEach(function (k) {
          var req = swap[k];
          var resolved = isPath(req) ? path.resolve(root, req) : resolve.sync(req, { basedir: root });
          swap[k] = resolved; 
        })
    })

  return swaps;
}

var go = module.exports = 

function (cwd, cb) {
  findParentDir(cwd, 'package.json', function (err, dir) {
    if (err) return cb(err);
    var pack = require(path.join(dir, 'package.json'))
      , config = pack['browserify-swap']
      , packages;

    if (config && config['@packages']) {
      packages = config['@packages'];
      delete config['@packages'];
      if (!Array.isArray(packages)) packages = [ packages ];
    }

    var swaps = resolvePaths(config, dir);

    cb(null, { swaps: swaps, packages: packages });
  })
}
