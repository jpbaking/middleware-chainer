'use strict';

const hro = require('./HiddenReadOnly');

function IllegalArgumentError(message) {
  if (!(this instanceof IllegalArgumentError)) {
    return new IllegalArgumentError(message);
  }
  Error.captureStackTrace(this, this.constructor);
  hro(this, 'message', message);
}
IllegalArgumentError.prototype = Object.create(Error.prototype);
IllegalArgumentError.prototype.constructor = IllegalArgumentError;
hro(IllegalArgumentError.prototype.constructor, 'name', 'IllegalArgumentError');
hro(IllegalArgumentError.prototype.constructor, 'toString', () => '[IllegalArgumentError]');
hro(IllegalArgumentError.prototype, 'name', 'IllegalArgumentError');

function noNullElementsValidator(o) {
  if (!(!!o) || !Array.isArray(o)) {
    return false;
  }
  for (let i = 0; i < o.length; i++) {
    if (o[i] === undefined || o[i] === null) {
      return false;
    }
  }
  return true;
}

const validator = {
  isTruthy: (o) => !!o,
  isFalsy: (o) => !(!!o),
  isUndefined: (o) => o === undefined,
  isNull: (o) => o === null,
  isObject: (o) => !!o && o.constructor === Object,
  isArray: (o) => !!o && Array.isArray(o),
  isString: (o) => 'string' === typeof o,
  isError: (o) => !!o && (o instanceof Error || (() => { try { return (new o() instanceof Error); } catch (_) { return false; } })()),
  isEmpty: (o) => validator.isUndefined(o) || validator.isNull(o) || (validator.isString(o) && o.length === 0) || (validator.isArray(o) && o.length === 0) || (validator.isObject(o) && Object.keys(o).length === 0),
  isNotEmpty: (o) => !validator.isEmpty(o),
  isBlank: (o) => validator.isString(o) && o.trim().length === 0,
  isNotBlank: (o) => validator.isString(o) && o.trim().length > 0,
  noNullElements: noNullElementsValidator
};

function validate(isOk, m, throwError = true) {
  if (!isOk) {
    if (throwError) {
      throw IllegalArgumentError(m);
    }
    else {
      return false;
    }
  }
  return true;
}

function isTruthy(o, message, throwError = true) {
  return validate(validator.isTruthy(o),
    message || 'should be truthy', throwError);
}

function isFalsy(o, message, throwError = true) {
  return validate(validator.isFalsy(o),
    message || 'should be falsy', throwError);
}

function isObject(o, message, throwError = true) {
  return validate(validator.isObject(o),
    message || 'should be an object literal', throwError);
}

function isArray(o, message, throwError = true) {
  return validate(validator.isArray(o),
    message || 'should be a valid array', throwError);
}

function isString(o, message, throwError = true) {
  return validate(validator.isString(o),
    message || 'should be a valid string', throwError);
}

function isError(o, message, throwError = true) {
  return validate(validator.isError(o),
    message || 'should be a valid type/prototype of `Error`', throwError);
}

function isEmpty(o, message, throwError = true) {
  return validate(validator.isEmpty(o),
    message || 'should be empty', throwError);
}

function isNotEmpty(o, message, throwError = true) {
  return validate(validator.isNotEmpty(o),
    message || 'should not be empty', throwError);
}

function isBlank(o, message, throwError = true) {
  return validate(validator.isBlank(o),
    message || 'should be blank', throwError);
}

function isNotBlank(o, message, throwError = true) {
  return validate(validator.isNotBlank(o),
    message || 'should not be blank', throwError);
}

function noNullElements(o, message, throwError = true) {
  return validate(validator.noNullElements(o),
    message || 'should not have null/undefined elements', throwError);
}

module.exports = {
  IllegalArgumentError,
  validate,
  validator,
  isTruthy,
  isFalsy,
  isObject,
  isArray,
  isString,
  isError,
  isEmpty,
  isNotEmpty,
  isBlank,
  isNotBlank,
  noNullElements
};
