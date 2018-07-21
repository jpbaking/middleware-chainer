'use strict';

const chain = require('./index');

function simple(...middlewares) {
  return chain({ middlewares });
}

module.exports = simple;