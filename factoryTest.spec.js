'use strict';

const path = require('path');
const testSuiteName = path.basename(__filename);

const assert = require('assert');
const sinon = require('sinon');

describe(testSuiteName, function () {

  const ChainFactory = require('./factory');

  it('should build pre-configured chain using defaults', function (done) {
    const factory = ChainFactory();
    const middleware = factory.chain();
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

  it('should build pre-configured chain', function (done) {
    const stub = sinon.stub();
    const expectedError = new Error('dis error');
    const factory = ChainFactory({
      name: 'lol',
      loggers: { debug: console.log },
      before: [
        (a, b, c) => { stub(a, b); c(expectedError); },
        (a, b, c) => { stub(a, b); c(); }
      ],
      after: [
        (a, b, c) => { stub(a, b); c(); },
        (a, b, c, d) => { stub(a, b, c); d(a); },
        (a, b, c, d) => { stub(a, b, c); d(a); }
      ]
    });
    const middleware = factory.chain();
    const next = (error) => {
      try {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(stub.callCount, 3);
        assert.deepStrictEqual(stub.args[0], ['daRequest', 'daResponse']);
        assert.deepStrictEqual(stub.args[1], [expectedError, 'daRequest', 'daResponse']);
        assert.deepStrictEqual(stub.args[2], [expectedError, 'daRequest', 'daResponse']);
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    };
    middleware('daRequest', 'daResponse', next);
  });

  it('should wrap middlewares between before/after', function (done) {
    const stub = sinon.stub();
    const expectedError = new Error('dis error');
    const factory = ChainFactory({
      before: [
        (a, b, c) => { stub(a, b); c(); },
        (a, b, c) => { stub(a, b); c(); }
      ],
      after: [
        (a, b, c) => { stub(a, b); c('lolx'); },
        (a, b, c, d) => { stub(a, b, c); d(a); },
        (a, b, c, d) => { stub(a, b, c); d(a); }
      ]
    });
    const middleware = factory.chain(
      (a, b, c) => { stub(a, b); c(expectedError); });
    const next = (error) => {
      try {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(stub.callCount, 5);
        assert.deepStrictEqual(stub.args[0], ['daRequest', 'daResponse']);
        assert.deepStrictEqual(stub.args[1], ['daRequest', 'daResponse']);
        assert.deepStrictEqual(stub.args[2], ['daRequest', 'daResponse']);
        assert.deepStrictEqual(stub.args[3], [expectedError, 'daRequest', 'daResponse']);
        assert.deepStrictEqual(stub.args[4], [expectedError, 'daRequest', 'daResponse']);
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    };
    middleware('daRequest', 'daResponse', next);
  });

});