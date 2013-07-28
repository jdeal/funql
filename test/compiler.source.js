/* global describe, it, before */
/* jshint expr: true */

var funql;
try {
  funql = require('../');
} catch (err) {
  funql = require('funql');
}

var expect = require('chai').expect;

var testCompile = function (source, compiledSource) {
  compiledSource = compiledSource || source;
  it('should compile: ' + source, function () {
    var result = funql.compilers.source(source);
    expect(result).to.equal(compiledSource);
  });
};

describe('funql source compiler', function () {
  testCompile('1');
  testCompile('2.3');
  testCompile('true');
  testCompile('false');
  testCompile('"hello"');
  testCompile('null');
  testCompile('foo');
  testCompile('foo(bar)');
  testCompile('foo(bar,baz)');
  testCompile('foo bar', '[foo bar]');
  testCompile('[foo bar]', '[foo bar]');
  testCompile('[foo [bar baz]]', '[foo [bar baz]]');
  testCompile('{}');
  testCompile('{foo:bar}', '{"foo":bar}');
  testCompile('{"foo":bar}');
});