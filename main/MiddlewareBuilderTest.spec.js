/* jshint ignore:start */
'use strict';

const path = require('path');
const testSuiteName = path.basename(__filename);

const assert = require('assert');

describe(testSuiteName, function () {

  const MiddlewareBuilder = require('./MiddlewareBuilder');

  it('should "cover"', function () {
    MiddlewareBuilder.prototype.useAsMiddleware();
    MiddlewareBuilder.prototype.useAsCatcher();
    MiddlewareBuilder.prototype.useAsFinally();
    MiddlewareBuilder.prototype.getCopyOfMiddlewares();
    MiddlewareBuilder.prototype.getCopyOfCatchers();
    MiddlewareBuilder.prototype.getCopyOfFinalizers();
    MiddlewareBuilder.prototype.build();
  });

  it('should validate middleware type', function () {
    const builder = MiddlewareBuilder();
    assert.doesNotThrow(() => builder.useAsMiddleware((a, b) => undefined, (a, b, c) => undefined));
    assert.throws(() => builder.useAsMiddleware((a, b, c) => undefined, undefined));
    assert.throws(() => builder.useAsMiddleware(undefined));
    assert.throws(() => builder.useAsMiddleware(null));
    assert.throws(() => builder.useAsMiddleware(''));
    assert.throws(() => builder.useAsMiddleware((a) => undefined));
    assert.throws(() => builder.useAsMiddleware((a, b, c, d) => undefined));
  });

  function validateCatcherType(func) {
    assert.doesNotThrow(() => func((a, b, c, d) => undefined, (a, b, c, d) => undefined));
    assert.throws(() => func((a, b, c, d) => undefined, undefined));
    assert.throws(() => func(undefined));
    assert.throws(() => func(null));
    assert.throws(() => func(''));
    assert.throws(() => func((a, b) => undefined));
    assert.throws(() => func((a, b, c) => undefined));
  }

  it('should validate catcher type', function () {
    const builder = MiddlewareBuilder();
    validateCatcherType(builder.useAsCatcher);
  });

  it('should validate finally type', function () {
    const builder = MiddlewareBuilder();
    validateCatcherType(builder.useAsFinally);
  });

  function validatePrivates(copyOfMiddlewares, copyOfCatchers, copyOfFinalizers) {
    assert.strictEqual(copyOfMiddlewares[0](), 'ab');
    assert.strictEqual(copyOfMiddlewares[1](), 'abc');
    assert.strictEqual(copyOfMiddlewares[2], undefined);
    assert.strictEqual(copyOfCatchers[0](), 'abcdCatcher');
    assert.strictEqual(copyOfCatchers[1], undefined);
    assert.strictEqual(copyOfFinalizers[0](), 'abcdFinally');
    assert.strictEqual(copyOfFinalizers[1], undefined);
  }

  it('should copy privates', function () {
    const builder = MiddlewareBuilder();
    builder.useAsMiddleware((a, b) => 'ab');
    builder.useAsMiddleware((a, b, c) => 'abc');
    builder.useAsCatcher((a, b, c, d) => 'abcdCatcher');
    builder.useAsFinally((a, b, c, d) => 'abcdFinally');
    validatePrivates(
      builder.getCopyOfMiddlewares(),
      builder.getCopyOfCatchers(),
      builder.getCopyOfFinalizers());
    let copyOfMiddlewares = builder.getCopyOfMiddlewares();
    let copyOfCatchers = builder.getCopyOfCatchers();
    let copyOfFinalizers = builder.getCopyOfFinalizers();
    copyOfMiddlewares.pop();
    copyOfCatchers.pop();
    copyOfFinalizers.pop();
    validatePrivates(
      builder.getCopyOfMiddlewares(),
      builder.getCopyOfCatchers(),
      builder.getCopyOfFinalizers());
  });

  it('should build middleware', function () {
    const builder = MiddlewareBuilder();
    builder.useAsMiddleware((a, b) => 'ab');
    builder.useAsMiddleware((a, b, c) => 'abc');
    builder.useAsCatcher((a, b, c, d) => 'abcdCatcher');
    builder.useAsFinally((a, b, c, d) => 'abcdFinally');
    assert.ok(builder.build());
  });

});