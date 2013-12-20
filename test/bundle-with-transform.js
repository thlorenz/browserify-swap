'use strict';
/*jshint asi: true */

var test = require('tap').test
  , browserify = require('browserify')
  , vm = require('vm')
  , swap = require('../')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

var fs = require('fs');
test('\nwhen I bundle a file requiring three files, two of which match the swap config', function (t) {
  var process_cwd = process.cwd;
  var dir = __dirname + '/resolve-swap'

  // simulate we are running browserify from the resolve-swap project
  process.cwd = function () { return dir; }
  process.env.BROWSERIFYSWAP_ENV = 'dev';
  
  browserify()
    .require(dir + '/index.js', { entry: true })
    .bundle(function (err, src) {
      process.cwd = process_cwd;

      if (err) { t.fail(err); t.end(); }

      var ctx = { window: {}, console: console };
      ctx.self = ctx.window;
      var require_ = vm.runInNewContext(src, ctx);
       
      
      fs.writeFileSync(__dirname + '/bundle.js', src, 'utf8')
      var main = require_(dir + '/index.js');
        
      t.end()
    });

})
