'use strict';
/*jshint asi: true */

var test = require('tap').test
  , browserify = require('browserify')
  , vm = require('vm')
  , reset = require('./util/reset')

var original = __dirname + '/resolve-swap'
  , copy     = __dirname + '/resolve-swap-copy'

var dir = copy;

// simulate we are running browserify from the resolve-swap project
process.env.BROWSERIFYSWAP_ROOT = dir; 

process.env.BROWSERIFYSWAP_DIAGNOSTICS = 1

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

reset(original, copy, runTests);

function runTests(err) {
  var swap = require('../')

  test('\nwhen I bundle a file requiring three files, two of which match the swap config', function (t) {
    if (err) { t.fail(err); t.end(); }
    
    process.env.BROWSERIFYSWAP_ENV = 'dev';
    
    browserify()
      .require(copy + '/index.js', {  expose: 'entry' })
      .bundle(function (err, src) {
        if (err) { t.fail(err); t.end(); }

        var ctx = { window: {}, console: console };
        ctx.self = ctx.window;
        var require_ = vm.runInNewContext(src, ctx);
        
        
        var main = require_('entry');
        t.deepEqual(
            main
          , { config: { name: 'config', swapped: false },
              hyperwatch:
              { name: 'hyperwatch',
                alias: 'some-hyperwatch-swap',
                swapped: true },
              util:
              { name: 'util',
                alias: 'myutil',
                swapped: true } }
          , 'swaps out the two modules that were configured to be swapped in that environment'
        )
          
        t.end()
      });
  })

  test('\nwhen I bundle a file requiring three files, one of which match the swap config', function (t) {
    if (err) { t.fail(err); t.end(); }
    
    process.env.BROWSERIFYSWAP_ENV = 'test';
    
    browserify()
      .require(copy + '/index.js', {  expose: 'entry' })
      .bundle(function (err, src) {
        if (err) { t.fail(err); t.end(); }

        var ctx = { window: {}, console: console };
        ctx.self = ctx.window;
        var require_ = vm.runInNewContext(src, ctx);
        
        
        var main = require_('entry');
        t.deepEqual(
            main
          , { config: { name: 'config', swapped: false },
              hyperwatch: { name: 'hyperwatch', swapped: false },
              util:
              { name: 'util',
                alias: 'test-util',
                swapped: true } }
          , 'swaps out the module that was configured to be swapped in that environment'
        )
          
        t.end()
      });
  })

  test('\nwhen I bundle a file requiring three files, but the env does not match any swap config', function (t) {
    if (err) { t.fail(err); t.end(); }
    
    process.env.BROWSERIFYSWAP_ENV = null;
    
    browserify()
      .require(copy + '/index.js', {  expose: 'entry' })
      .bundle(function (err, src) {
        if (err) { t.fail(err); t.end(); }

        var ctx = { window: {}, console: console };
        ctx.self = ctx.window;
        var require_ = vm.runInNewContext(src, ctx);
        
        var main = require_('entry');
        t.deepEqual(
            main
          , { config: { name: 'config', swapped: false },
              hyperwatch: { name: 'hyperwatch', swapped: false },
              util: { name: 'util', swapped: false } }
          , 'swaps out no modules'
        )
          
        t.end()
      });
  })
}
