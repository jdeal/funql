/* global describe, it, before */
/* jshint expr: true */

var funql;
try {
  funql = require('../');
} catch (err) {
  funql = require('funql');
}

var expect = require('chai').expect;

var testCompile = function (source, params, compiledSource) {
  it('should compile: ' + source + ' with ' + JSON.stringify(params), function () {
    var result = funql.compilers.replace(source, params);
    expect(result).to.equal(compiledSource);
  });
};

describe('funql replace compiler', function () {
  testCompile("foo(bar)", {bar: 'baz'}, 'foo("baz")');
  testCompile("foo($bar)", {$bar: 'baz'}, 'foo("baz")');
  testCompile("foo(bar)", {bar: 1}, 'foo(1)');
  testCompile("foo(bar)", {bar: true}, 'foo(true)');
  testCompile("foo(bar)", {bar: ['baz']}, 'foo(["baz"])');
});
