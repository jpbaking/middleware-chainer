'use strict';

const path = require('path');
const testSuiteName = path.basename(__filename);

const assert = require('assert');

describe(testSuiteName, function () {

  const peek = require('./Peek');

  it('should return top of array', function () {
    assert.strictEqual(peek(['first', 'this is last']), 'this is last');
    assert.strictEqual(peek([]), undefined);
    assert.strictEqual(peek(), undefined);
  });

});