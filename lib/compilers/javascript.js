var binaryFunctions = {
  'or': '||',
  'and': '&&'
};

var specialFunctions = {
  'if': function (args, compile) {
    var conditional = 'null';
    var thenExpr = 'null';
    var elseExpr = 'null';
    if (args.length >= 1) {
      conditional = compile(args[0]);
      thenExpr = conditional;
    }
    if (args.length >= 2) {
      thenExpr = compile(args[1]);
    }
    if (args.length >= 3) {
      elseExpr = compile(args[2]);
    }
    return '(' + conditional + ' ? ' + thenExpr + ' : ' + elseExpr + ')';
  },
  'fn': function (args, compile) {
    if (args.length > 0) {
      var paramsNode = args[0];
      if (paramsNode.type === 'array') {
        params = compile(paramsNode.nodes, {isFnParams: true});
      }
    }
    var body = '';
    if (args.length > 1) {
      body = compile(args[1], {fnParams: params});
    }
    return '(function (' + params.join(',') + ') {return ' + body + '})';
  }
};

var globalNames = {
  'null': true,
  'true': true,
  'false': true
};

module.exports = {
  call: function (node, compile) {
    var callee = compile(node.nodes[0], {isCallee: true});
    if (binaryFunctions[callee]) {
      var args = node.nodes[1].nodes;
      return '(' + compile(args).join(' ' + binaryFunctions[callee] + ' ') + ')';
    } else if (specialFunctions[callee]) {
      return specialFunctions[callee](node.nodes[1].nodes, compile);
    }
    return callee + compile(node.nodes[1]);
  },
  name: function (node, compile, context) {
    var name = node.value;
    if (context.isFnParams) {
      return name;
    } else if (context.isCallee) {
      if (binaryFunctions[name] || specialFunctions[name]) {
        return name;
      } else {
        return 'functions.' + name;
      }
    } else if (context.fnParams && context.fnParams.indexOf(name) >= 0) {
      return name;
    } else {
      return 'context.' + name;
    }
    if (globalNames[name] || binaryFunctions[name]) {
      return name;
    }
  },
  arguments: function (node, compile) {
    return '(' + compile(node.nodes).join(',') + ')';
  },
  empty: function () {
    return '';
  },
  value: function (node, compile) {
    return JSON.stringify(node.value);
  },
  array: function (node, compile) {
    return '[' + compile(node.nodes).join(', ') + ']';
  },
  object: function (node, compile) {
    return '{' + compile(node.nodes).join(', ') + '}';
  },
  property: function (node, compile) {
    return compile(node.nodes[0]) + ':' + compile(node.nodes[1]);
  }
};
