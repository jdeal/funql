/* global describe, it, before */
/* jshint expr: true */

var funql;
try {
  funql = require('../');
} catch (err) {
  funql = require('funql');
}

var expect = require('chai').expect;

var checkNode = function (source, expectNode, value) {
  if (typeof expectNode === 'string') {
    expectNode = funql.node(expectNode, value);
  }
  it('should map ' + source + ' to ' + expectNode.type + ' node', function () {
    var node = funql.parse(source);
    expect(node).to.deep.equal(expectNode);
  });
};

describe('funql parser', function () {
  checkNode('1', 'integer', 1);
  checkNode('1.2', 'float', 1.2);
  checkNode('-1', 'integer', -1);
  checkNode('-1.2', 'float', -1.2);
  checkNode("'abc'", 'string', 'abc');
  checkNode('"abc"', 'string', 'abc');
  checkNode("'x\\'y'", 'string', "x'y");
  checkNode('"x\\"y"', 'string', 'x"y');
  checkNode('true', 'boolean', true);
  checkNode('false', 'boolean', false);
  checkNode('foo', 'name', 'foo');
  checkNode('foo()', funql.node('call', [funql.node('name', 'foo'), funql.node('arguments', [])]));
  checkNode('  1  ', 'integer', 1);
  checkNode('  ', 'empty', null);
  checkNode('null', 'null', null);
  checkNode('1 2', funql.node('array', [funql.node('integer', 1), funql.node('integer', 2)]));
  checkNode('[1 2]', funql.node('array', [funql.node('integer', 1), funql.node('integer', 2)]));
});