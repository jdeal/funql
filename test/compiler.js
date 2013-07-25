/* global describe, it, before */
/* jshint expr: true */

var funql;
try {
  funql = require('../');
} catch (err) {
  funql = require('funql');
}

var expect = require('chai').expect;

var identityCompile = funql.compiler({
  call: function (args, compile) {
    return compile(args[0]) + compile(args[1]);
  },
  name: function (value, compile) {
    return value;
  },
  arguments: function (args, compile) {
    return '(' + args.map(function (arg) {
      return compile(arg);
    }).join(',') + ')';
  }
});

var jsCompile = funql.compiler({
  call_if: function (args, compile) {
    args = args[1].args;
    var result = 'if (' + compile(args[0]) + ') {' + compile(args[1]) + '}';
    if (args[2]) {
      result += ' else {' + compile(args[2]) + '}';
    }
    return result;
  },
  name: function (value, compile) {
    return value;
  }
});

var contextCompile = funql.compiler({
  call: function (args, compile, context) {
    var callee = compile(args[0], {prefix: ''});
    var currentPrefix = context.prefix || '';
    var newPrefix = currentPrefix + callee + '_';
    return currentPrefix + callee + compile(args[1], {prefix: newPrefix});
  },
  name: function (value, compile, context) {
    return (context.prefix || '') + value;
  },
  arguments: function (args, compile, context) {
    return '(' + args.map(function (arg) {
      return compile(arg);
    }).join(',') + ')';
  }
});

describe('funql compiler', function () {
  it('should compile with identity compiler', function () {
    var source = 'foo(bar)';
    var result = identityCompile(source);
    expect(result).to.equal(source);
  });
  it('should compile to JavaScript', function () {
    var source = 'if(x,y,z)';
    var result = jsCompile(source);
    expect(result).to.equal('if (x) {y} else {z}');
  });
  it('should compile and pass context correctly', function () {
    var source = 'foo(bar(x),baz(y))';
    var result = contextCompile(source);
    expect(result).to.equal('foo(foo_bar(foo_bar_x),foo_baz(foo_baz_y))');
  });
});