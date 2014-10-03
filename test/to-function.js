/* global describe, it, before */
/* jshint expr: true */

var funql;
try {
  funql = require('../');
} catch (err) {
  funql = require('funql');
}

var expect = require('chai').expect;

var fnMap = {
  inc: function (x) {
    return x + 1;
  }
};

var checkResult = function (source, context, expectedResult) {
  it('should map ' + source + ' to ' + JSON.stringify(expectedResult), function () {
    var result = funql.toFunction(source, fnMap).call(null, context);
    expect(result).to.deep.equal(expectedResult);
  });
};

describe('funql parser', function () {
  checkResult('1', {}, 1);
  checkResult('or(false,true)', {}, true);
  checkResult('foo', {foo: 1}, 1);
  checkResult('inc(foo)', {foo: 1}, 2);
  checkResult('sum()', {}, 0);
  checkResult('sum(1)', {}, 1);
  checkResult('sum(1,2)', {}, 3);
  checkResult('sum(1,2,3)', {}, 6);
});
