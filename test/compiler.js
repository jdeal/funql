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
    return '(' + compile(args).join(',') + ')';
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

var argsCompile = funql.compiler({
  call_add: function (args, compile, context) {
    args = args[1].args;
    return args.reduce(function (prev, curr, i) {
      return compile(prev) + compile(curr);
    });
  },
  name: function (value, compile, context) {
    return context[value];
  }
});

var wrapCompile = funql.compiler({
  __wrap__: function (ast, compile) {
    return 'wrap(' + compile(ast) + ')';
  },
  name: function (value, compile) {
    return value;
  }
});

var multiTypeCompile = funql.compiler({
  call: function (args, compile) {
    return compile(args).join('');
  },
  arguments: function (args, compile) {
    return '(' + compile(args).join(',') + ')';
  },
  'name, number': function (value, compile) {
    return value;
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
  it('should allow passing context to compiler', function () {
    var source = 'add(x,y)';
    var result = argsCompile(source, {x: 1, y: 2});
    expect(result).to.equal(3);
  });
  it('should allow __wrap__ pseudo node handler to wrap ast', function () {
    var source = 'x';
    var result = wrapCompile(source);
    expect(result).to.equal('wrap(x)');
  });
  it('should allow multiple types per handler', function () {
    var source = 'foo(x,1)';
    var result = multiTypeCompile(source);
    expect(result).to.equal(source);
  });
  it('should compile an ast', function () {
    var source = 'foo(bar)';
    var ast = funql.parse(source);
    var result = identityCompile(ast);
    expect(result).to.equal(source);
  });
});