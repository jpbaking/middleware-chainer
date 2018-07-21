'use strict';

const path = require('path');
const testSuiteName = path.basename(__filename);

const assert = require('assert');
const sinon = require('sinon');

describe(testSuiteName, function () {

  const chain = require('./Chainer');

  it('should pass next if empty middlewares', function (done) {
    const middleware = chain();
    const next = (error) => {
      try {
        assert.strictEqual(error, undefined, 'an unexpected error was thrown');
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    };
    middleware('daRequest', 'daResponse', next);
  });

  it('should pass next error to top', function (done) {
    const stub = sinon.stub();
    const expectedError = new Error('da-error');
    expectedError.stack = undefined;
    const middleware = chain({
      middlewares: [
        (a, b) => { stub(a, b); throw expectedError; },
        (a, b, c, d) => { stub(a, b, c, d); d(a); }
      ]
    });
    const next = (error) => {
      try {
        assert.strictEqual(error, expectedError);
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    };
    middleware('daRequest', 'daResponse', next);
  });

  it('should pass next non-error to top', function (done) {
    const stub = sinon.stub();
    const expectedError = 'da-error';
    const middleware = chain({
      middlewares: [
        (a, b, c) => { stub(a, b, c); c(expectedError); },
        (a, b, c, d) => { stub(a, b, c, d); d(a); }
      ]
    });
    const next = (error) => {
      try {
        assert.strictEqual(error, 'da-error');
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    };
    middleware('daRequest', 'daResponse', next);
  });

  it('should use name and logger', function (done) {
    const stub = sinon.stub();
    const expectedError = new Error('da-error');
    const middleware = chain({
      name: 'da-mw',
      loggers: {
        debug: stub,
        error: stub
      },
      middlewares: [
        (a, b) => { stub(a, b); throw expectedError; },
        (a, b, c, d) => { stub(a, b, c, d); d(a); }
      ]
    });
    middleware('daReq', 'daRes', (error) => {
      try {
        assert.strictEqual(error, expectedError);
        // - DEBUG -
        // for (let callIndex = 0; callIndex < stub.args.length; callIndex++) {
        //   for (let argIndex = 0; argIndex < stub.args[callIndex].length; argIndex++) {
        //     console.log('- [%s:%s] - %s', callIndex, argIndex, stub.args[callIndex][argIndex]);
        //   }
        // }
        assert.strictEqual(stub.callCount, 6);
        assert.strictEqual(stub.args[0][0], '[da-mw:middleware:0] - start -');
        assert.strictEqual(stub.args[1][0], 'daReq');
        assert.strictEqual(stub.args[1][1], 'daRes');
        assert.ok(stub.args[2][0].startsWith('[da-mw:middleware:0] An unhandled error was thrown.\n    | Error: da-error'));
        assert.strictEqual(stub.args[3][0], '[da-mw:catcher:0] - start -');
        assert.strictEqual(stub.args[4][0], expectedError);
        assert.strictEqual(stub.args[4][1], 'daReq');
        assert.strictEqual(stub.args[4][2], 'daRes');
        assert.ok(stub.args[4][3] instanceof Function);
        assert.strictEqual(stub.args[5][0], '[da-mw:catcher:0] - called next -');
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    });
  });

  it('should warn if diff error was passed by catcher', function (done) {
    const stub = sinon.stub();
    const expectedError = 'da-error';
    const catcherError = 'ca-error';
    const middleware = chain({
      name: 'da-mw',
      loggers: {
        debug: stub,
        error: stub
      },
      middlewares: [
        (a, b) => { stub(a, b); throw expectedError; },
        (a, b, c, d) => { stub(a, b, c, d); d(catcherError); },
        (a, b, c, d) => { stub(a, b, c, d); d(a); },
        (a, b, c, d) => { stub(a, b, c, d); d(a); }
      ]
    });
    middleware('daReq', 'daRes', (error) => {
      try {
        assert.strictEqual(error, catcherError);
        // - DEBUG -
        // for (let callIndex = 0; callIndex < stub.args.length; callIndex++) {
        //   for (let argIndex = 0; argIndex < stub.args[callIndex].length; argIndex++) {
        //     console.log('- [%s:%s] - %s', callIndex, argIndex, stub.args[callIndex][argIndex]);
        //   }
        // }
        assert.strictEqual(stub.callCount, 13);
        assert.strictEqual(stub.args[0][0], '[da-mw:middleware:0] - start -');
        assert.strictEqual(stub.args[1][0], 'daReq');
        assert.strictEqual(stub.args[1][1], 'daRes');
        assert.ok(stub.args[2][0].startsWith('[da-mw:middleware:0] An unhandled error was thrown.\n    | da-error'));
        assert.strictEqual(stub.args[3][0], '[da-mw:catcher:0] - start -');
        assert.strictEqual(stub.args[4][0], expectedError);
        assert.strictEqual(stub.args[4][1], 'daReq');
        assert.strictEqual(stub.args[4][2], 'daRes');
        assert.ok(stub.args[4][3] instanceof Function);
        assert.strictEqual(stub.args[5][0], '[da-mw:catcher:0] - called next -');
        assert.strictEqual(stub.args[6][0], '[da-mw:catcher:0] A different error was passed.\n    | ca-error');
        assert.strictEqual(stub.args[7][0], '[da-mw:catcher:1] - start -');
        assert.strictEqual(stub.args[8][0], catcherError);
        assert.strictEqual(stub.args[8][1], 'daReq');
        assert.strictEqual(stub.args[8][2], 'daRes');
        assert.ok(stub.args[8][3] instanceof Function);
        assert.strictEqual(stub.args[9][0], '[da-mw:catcher:1] - called next -');
        assert.strictEqual(stub.args[10][0], '[da-mw:catcher:2] - start -');
        assert.strictEqual(stub.args[11][0], catcherError);
        assert.strictEqual(stub.args[11][1], 'daReq');
        assert.strictEqual(stub.args[11][2], 'daRes');
        assert.ok(stub.args[11][3] instanceof Function);
        assert.strictEqual(stub.args[12][0], '[da-mw:catcher:2] - called next -');
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    });
  });

  it('should warn if diff error thrown by catcher', function (done) {
    const stub = sinon.stub();
    const expectedError = 'da-error';
    const catcherError = new Error('ca-error');
    const middleware = chain({
      name: 'da-mw',
      loggers: {
        debug: stub,
        error: stub
      },
      middlewares: [
        (a, b) => { stub(a, b); throw expectedError; },
        (a, b, c, d) => { stub(a, b, c, d); throw catcherError; },
        (a, b, c, d) => { stub(a, b, c, d); d(a); },
        (a, b, c, d) => { stub(a, b, c, d); d(a); }
      ]
    });
    middleware('daReq', 'daRes', (error) => {
      try {
        assert.strictEqual(error, catcherError);
        // - DEBUG -
        // for (let callIndex = 0; callIndex < stub.args.length; callIndex++) {
        //   for (let argIndex = 0; argIndex < stub.args[callIndex].length; argIndex++) {
        //     console.log('- [%s:%s] - %s', callIndex, argIndex, stub.args[callIndex][argIndex]);
        //   }
        // }
        assert.strictEqual(stub.callCount, 14);
        assert.strictEqual(stub.args[0][0], '[da-mw:middleware:0] - start -');
        assert.strictEqual(stub.args[1][0], 'daReq');
        assert.strictEqual(stub.args[1][1], 'daRes');
        assert.ok(stub.args[2][0].startsWith('[da-mw:middleware:0] An unhandled error was thrown.\n    | da-error'));
        assert.strictEqual(stub.args[3][0], '[da-mw:catcher:0] - start -');
        assert.strictEqual(stub.args[4][0], expectedError);
        assert.strictEqual(stub.args[4][1], 'daReq');
        assert.strictEqual(stub.args[4][2], 'daRes');
        assert.ok(stub.args[4][3] instanceof Function);
        assert.ok(stub.args[5][0].startsWith('[da-mw:catcher:0] An unhandled error was thrown.\n    | Error: ca-error'));
        assert.strictEqual(stub.args[6][0], '[da-mw:catcher:0] - called next -');
        assert.ok(stub.args[7][0].startsWith('[da-mw:catcher:0] A different error was passed.\n    | Error: ca-error'));
        assert.strictEqual(stub.args[8][0], '[da-mw:catcher:1] - start -');
        assert.strictEqual(stub.args[9][0], catcherError);
        assert.strictEqual(stub.args[9][1], 'daReq');
        assert.strictEqual(stub.args[9][2], 'daRes');
        assert.ok(stub.args[9][3] instanceof Function);
        assert.strictEqual(stub.args[10][0], '[da-mw:catcher:1] - called next -');
        assert.strictEqual(stub.args[11][0], '[da-mw:catcher:2] - start -');
        assert.strictEqual(stub.args[12][0], catcherError);
        assert.strictEqual(stub.args[12][1], 'daReq');
        assert.strictEqual(stub.args[12][2], 'daRes');
        assert.ok(stub.args[12][3] instanceof Function);
        assert.strictEqual(stub.args[13][0], '[da-mw:catcher:2] - called next -');
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    });
  });

  it('should warn if no error was passed by catcher', function (done) {
    const stub = sinon.stub();
    const expectedError = 'da-error';
    const middleware = chain({
      name: 'da-mw',
      loggers: {
        debug: stub,
        error: stub
      },
      middlewares: [
        (a, b) => { stub(a, b); throw expectedError; },
        (a, b, c, d) => { stub(a, b, c, d); d(); },
        (a, b, c, d) => { stub(a, b, c, d); d(a); }
      ]
    });
    middleware('daReq', 'daRes', (error) => {
      try {
        assert.strictEqual(error, undefined);
        // - DEBUG -
        // for (let callIndex = 0; callIndex < stub.args.length; callIndex++) {
        //   for (let argIndex = 0; argIndex < stub.args[callIndex].length; argIndex++) {
        //     console.log('- [%s:%s] - %s', callIndex, argIndex, stub.args[callIndex][argIndex]);
        //   }
        // }
        assert.strictEqual(stub.callCount, 7);
        assert.strictEqual(stub.args[0][0], '[da-mw:middleware:0] - start -');
        assert.strictEqual(stub.args[1][0], 'daReq');
        assert.strictEqual(stub.args[1][1], 'daRes');
        assert.ok(stub.args[2][0].startsWith('[da-mw:middleware:0] An unhandled error was thrown.\n    | da-error'));
        assert.strictEqual(stub.args[3][0], '[da-mw:catcher:0] - start -');
        assert.strictEqual(stub.args[4][0], expectedError);
        assert.strictEqual(stub.args[4][1], 'daReq');
        assert.strictEqual(stub.args[4][2], 'daRes');
        assert.ok(stub.args[4][3] instanceof Function);
        assert.strictEqual(stub.args[5][0], '[da-mw:catcher:0] - called next -');
        assert.strictEqual(stub.args[6][0], '[da-mw:catcher:0] No error was passed by catcher.');
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    });
  });

  it('should recurse through all middlewares', function (done) {
    const stub = sinon.stub();
    const middleware = chain({
      middlewares: [
        (a, b, c) => { stub(a, b, c); c(); },
        (a, b, c) => { stub(a, b, c); c(); },
        (a, b, c, d) => { stub(a, b, c, d); d(a); },
      ]
    });
    middleware('daReq', 'daRes', (error) => {
      try {
        assert.strictEqual(error, undefined);
        // - DEBUG -
        // for (let callIndex = 0; callIndex < stub.args.length; callIndex++) {
        //   for (let argIndex = 0; argIndex < stub.args[callIndex].length; argIndex++) {
        //     console.log('- [%s:%s] - %s', callIndex, argIndex, stub.args[callIndex][argIndex]);
        //   }
        // }
        assert.strictEqual(stub.callCount, 2);
        assert.strictEqual(stub.args[0][0], 'daReq');
        assert.strictEqual(stub.args[0][1], 'daRes');
        assert.ok(stub.args[0][2] instanceof Function);
        assert.strictEqual(stub.args[1][0], 'daReq');
        assert.strictEqual(stub.args[1][1], 'daRes');
        assert.ok(stub.args[1][2] instanceof Function);
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    });
  });

  it('should validate if valid middleware', function () {
    assert.throws(() => chain({
      middlewares: [() => undefined]
    }));
    assert.throws(() => chain({
      middlewares: [undefined]
    }));
    assert.throws(() => chain({
      middlewares: ['asdasdasd']
    }));
    assert.throws(() => chain({
      middlewares: [(a) => undefined]
    }));
    assert.throws(() => chain({
      middlewares: [(a, b, c, d, e) => undefined]
    }));
  });

});