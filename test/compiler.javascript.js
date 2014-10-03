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
    var result = funql.compilers.javascript(source);
    expect(result).to.equal(compiledSource);
  });
};

describe('funql javascript compiler', function () {
  testCompile('1');
  testCompile('2.3');
  testCompile('true');
  testCompile('false');
  testCompile('"hello"');
  testCompile('null');
  testCompile('foo', 'context.foo');
  testCompile('foo(bar)', 'functions.foo(context.bar)');
  testCompile('foo(bar,baz)', 'functions.foo(context.bar,context.baz)');
  testCompile('foo bar', '[context.foo, context.bar]');
  testCompile('[foo bar]', '[context.foo, context.bar]');
  testCompile('[foo [bar baz]]', '[context.foo, [context.bar, context.baz]]');
  testCompile('{}');
  testCompile('{foo:bar}', '{"foo":context.bar}');
  testCompile('{"foo":bar}', '{"foo":context.bar}');
  testCompile('or(false,true)', '(false || true)')
});
