'use strict';

const isArray = require('./Assert').validator.isArray;

module.exports = (array) => isArray(array) && array.length > 0 ? array[array.length - 1] : undefined;