'use strict';

const chain = require('./index');

const Assert = require('./main/helpers/Assert');
const validator = Assert.validator;
const isObject = validator.isObject;
const isArray = validator.isArray;
const isNotBlank = validator.isNotBlank;

function ChainFactory(params) {
  if (!(this instanceof ChainFactory)) {
    return new ChainFactory(params);
  }
  params = isObject(params) ? params : {};
  this.name = isNotBlank(params.name) ? params.name : 'mw-chain';
  this.loggers = isObject(params.loggers) ? params.loggers : {};
  this.before = isArray(params.before) ? params.before : [];
  this.after = isArray(params.after) ? params.after : [];
}

function join(...arrays) {
  const joinedArray = [];
  arrays.forEach((array) => {
    array.forEach((item) => {
      joinedArray.push(item);
    });
  });
  return joinedArray;
}

ChainFactory.prototype.chain = function (...middlewares) {
  return chain({
    name: this.name,
    loggers: this.loggers,
    middlewares: join(this.before, middlewares, this.after)
  });
};

module.exports = ChainFactory;