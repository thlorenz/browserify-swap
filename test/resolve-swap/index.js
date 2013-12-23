'use strict';

// swapped nowhere
var config = require('./config');

// swapped in 'dev' only
var hyperwatch = require('hyperwatch');

// swapped in 'dev' and 'test'
var util = require('./util');

module.exports = {
    config     :  config
  , hyperwatch :  hyperwatch
  , util       :  util
}
