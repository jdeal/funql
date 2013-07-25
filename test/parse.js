/* global describe, it, before */
/* jshint expr: true */

var funql;
try {
  funql = require('../');
} catch (err) {
  funql = require('funql');
}

var expect = require('chai').expect;

describe('funql parser', function () {
  it('should escape apostrophe', function () {
    var node = funql.parse("'x\\'y'");
    expect(node.value).to.equal("x'y");
  });
  it('should escape double-quote', function () {
    var node = funql.parse('"x\\"y"');
    expect(node.value).to.equal('x"y');
  });
});