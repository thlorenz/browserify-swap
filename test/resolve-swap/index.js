'use strict';

// swapped nowhere
var path = require('path');

// swapped in 'dev' only
var hyperwatch = require('hyperwatch');

// swapped in 'dev' and 'test'
var util = require('util');

module.exports = {
    path       :  path
  , hyperwatch :  hyperwatch
  , util       :  util
}
