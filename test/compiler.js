/* global describe, it, before */
/* jshint expr: true */

var funql;
try {
  funql = require('../');
} catch (err) {
  funql = require('funql');
}

var expect = require('chai').expect;

var sourceCompile = funql.compiler({
  call: function (node, compile) {
    return compile(node.nodes[0]) + compile(node.nodes[1]);
  },
  name: function (node, compile) {
    return node.value;
  },
  arguments: function (node, compile) {
    return '(' + compile(node.nodes).join(',') + ')';
  }
});

var jsCompile = funql.compiler({
  call_if: function (node, compile) {
    var args = node.nodes[1].nodes;
    var result = 'if (' + compile(args[0]) + ') {' + compile(args[1]) + '}';
    if (args[2]) {
      result += ' else {' + compile(args[2]) + '}';
    }
    return result;
  },
  name: function (node, compile) {
    return node.value;
  }
});

var contextCompile = funql.compiler({
  call: function (node, compile, context) {
    var callee = compile(node.nodes[0], {prefix: ''});
    var currentPrefix = context.prefix || '';
    var newPrefix = currentPrefix + callee + '_';
    return currentPrefix + callee + compile(node.nodes[1], {prefix: newPrefix});
  },
  name: function (node, compile, context) {
    return (context.prefix || '') + node.value;
  },
  arguments: function (node, compile, context) {
    return '(' + node.nodes.map(function (arg) {
      return compile(arg);
    }).join(',') + ')';
  }
});

var argsCompile = funql.compiler({
  call_add: function (node, compile, context) {
    var args = node.nodes[1].nodes;
    return args.reduce(function (prev, curr, i) {
      return compile(prev) + compile(curr);
    });
  },
  name: function (node, compile, context) {
    return context[node.value];
  }
});

var wrapCompile = funql.compiler({
  wrap_root: function (node, compile) {
    return 'wrap(' + compile(node) + ')';
  },
  name: function (node, compile) {
    return node.value;
  }
});

var identityCompile = funql.compiler({
  node: function (node, compile) {
    if (node.nodes) {
      return {type: node.type, nodes: compile(node.nodes)};
    } else {
      return {type: node.type, value: node.value};
    }
  }
});

var wrapAllCompile = funql.compiler({
  wrap_node: function (node, compile) {
    return '(' + compile(node) + ')';
  },
  node: function (node, compile) {
    if (node.nodes) {
      return node.type + ' ' + compile(node.nodes).join(' ');
    } else {
      return node.type + ' ' + node.value;
    }
  }
});

var fallbackCompileNumber = funql.compiler({
  'number': function (node) {
    return node.value;
  }
});

var fallbackCompileValue = funql.compiler({
  'value': function (node) {
    return node.value;
  }
});

var fallbackCompileListItem = funql.compiler({
  'list': function (node, compile) {
    return compile(node.nodes);
  },
  'item': function (node) {
    return node.value;
  }
});

var multiTypeCompile = funql.compiler({
  call: function (node, compile) {
    return compile(node.nodes).join('');
  },
  arguments: function (node, compile) {
    return '(' + compile(node.nodes).join(',') + ')';
  },
  'name, integer, float': function (node, compile) {
    return node.value;
  }
});

var testFallback = function (fallbackType, compiler, source, result) {
  it('should fallback to ' + fallbackType, function () {
    expect(compiler(source)).to.deep.equal(result);
  });
};

describe('funql compiler', function () {
  it('should compile with source compiler', function () {
    var source = 'foo(bar)';
    var result = sourceCompile(source);
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
  it('should allow wrap_root pseudo node handler to wrap ast', function () {
    var source = 'x';
    var result = wrapCompile(source);
    expect(result).to.equal('wrap(x)');
  });
  it('should compile with identity compiler', function () {
    var source = 'foo(bar)';
    var ast = funql.parse(source);
    var result = identityCompile(source);
    expect(result).to.deep.equal(ast);
  });
  it('should wrap all nodes', function () {
    var source = 'foo(bar,1)';
    var result = wrapAllCompile(source);
    expect(result).to.equal('(call (name foo) (arguments (name bar) (integer 1)))');
  });
  it('should allow multiple types per handler', function () {
    var source = 'foo(x,1,2.3)';
    var result = multiTypeCompile(source);
    expect(result).to.equal(source);
  });
  it('should compile an ast', function () {
    var source = 'foo(bar)';
    var ast = funql.parse(source);
    var result = sourceCompile(ast);
    expect(result).to.equal(source);
  });
  testFallback('number', fallbackCompileNumber, '1', 1);
  testFallback('value', fallbackCompileValue, '1', 1);
  testFallback('list/item', fallbackCompileListItem,
    'foo([1,"a",true],bar)',
    ['foo', [[1, 'a', true], 'bar']]);
});