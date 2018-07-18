'use strict';

const Assert = require('./helpers/Assert');
const hro = require('./helpers/HiddenReadOnly');

function useAsMiddleware(middlewares, _middlewares) {
  Assert.isNotEmpty(middlewares, '`middlewares` cannot be empty');
  Assert.noNullElements(middlewares, '`middlewares` cannot have null elements');
  middlewares.forEach((middleware) => {
    Assert.validate(middleware instanceof Function && middleware.length > 1 && middleware.length < 4,
      'not a valid middleware; must be: (req, res[, next])');
    _middlewares.push(middleware);
  });
}

function useAsCatcher(middlewares, _catchers) {
  Assert.isNotEmpty(middlewares, '`middlewares` cannot be empty');
  Assert.noNullElements(middlewares, '`middlewares` cannot have null elements');
  middlewares.forEach((middleware) => {
    Assert.validate(middleware instanceof Function && middleware.length === 4,
      'not a valid "catcher" middleware; must be: (err, req, res, next)');
    _catchers.push(middleware);
  });
}

function useAsFinally(middlewares, _finals) {
  Assert.isNotEmpty(middlewares, '`middlewares` cannot be empty');
  Assert.noNullElements(middlewares, '`middlewares` cannot have null elements');
  middlewares.forEach((middleware) => {
    Assert.validate(middleware instanceof Function && middleware.length === 4,
      'not a valid "finally" middleware; must be: (err, req, res, next)');
    _finals.push(middleware);
  });
}

function build(_middlewares, _catchers, _finalizers) {
  return true;
}

function MiddlewareBuilder() {
  if (!(this instanceof MiddlewareBuilder)) {
    return new MiddlewareBuilder();
  }
  const _middlewares = [];
  const _catchers = [];
  const _finalizers = [];
  hro(this, 'useAsMiddleware', (...middlewares) => { useAsMiddleware(middlewares, _middlewares); return this; });
  hro(this, 'useAsCatcher', (...middlewares) => { useAsCatcher(middlewares, _catchers); return this; });
  hro(this, 'useAsFinally', (...middlewares) => { useAsFinally(middlewares, _finalizers); return this; });
  hro(this, 'getCopyOfMiddlewares', () => _middlewares.map((entry) => entry));
  hro(this, 'getCopyOfCatchers', () => _catchers.map((entry) => entry));
  hro(this, 'getCopyOfFinalizers', () => _finalizers.map((entry) => entry));
  hro(this, 'build', () => build(_middlewares, _catchers, _finalizers));
}


// to help with autocomplete
/* jshint ignore:start */
MiddlewareBuilder.prototype.useAsMiddleware = (...middlewares) => { };
MiddlewareBuilder.prototype.useAsCatcher = (...middlewares) => { };
MiddlewareBuilder.prototype.useAsFinally = (...middlewares) => { };
MiddlewareBuilder.prototype.getCopyOfMiddlewares = () => { };
MiddlewareBuilder.prototype.getCopyOfCatchers = () => { };
MiddlewareBuilder.prototype.getCopyOfFinalizers = () => { };
MiddlewareBuilder.prototype.build = () => { };
/* jshint ignore:end */

module.exports = MiddlewareBuilder;