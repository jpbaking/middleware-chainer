'use strict';

const path = require('path');
const testSuiteName = path.basename(__filename);

const assert = require('assert');
const sinon = require('sinon');

describe(testSuiteName, function () {

  const chain = require('./simple');

  it('should simply chain even if empty', function (done) {
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

  it('should simply chain middlewares', function (done) {
    const stub = sinon.stub();
    const expectedError = new Error('dis error');
    const middleware = chain(
      (a, b, c) => { stub(a, b); c(); },
      (a, b, c) => { stub(a, b); c(expectedError); },
      (a, b, c) => { stub(`lolx-${a}`, `lolx-${b}`); c('lolx'); },
      (a, b, c, d) => { stub(a, b, c); d(a); });
    const next = (error) => {
      try {
        assert.strictEqual(error, expectedError);
        assert.strictEqual(stub.callCount, 3);
        assert.deepStrictEqual(stub.args[0], ['daRequest', 'daResponse']);
        assert.deepStrictEqual(stub.args[1], ['daRequest', 'daResponse']);
        assert.deepStrictEqual(stub.args[2], [expectedError, 'daRequest', 'daResponse']);
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    };
    middleware('daRequest', 'daResponse', next);
  });

});