var binaryFunctions = {
  'or': '||',
  'and': '&&'
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
      var args = node.nodes[1];
      return '(' + compile(args.nodes).join(' ' + binaryFunctions[callee] + ' ') + ')';
    } else if (callee === 'fn') {
      var args = node.nodes[1];
      if (args.nodes.length > 0) {
        var paramsNode = args.nodes[0];
        if (paramsNode.type === 'array') {
          params = compile(paramsNode.nodes, {isFnParams: true});
        }
      }
      var body = '';
      if (args.nodes.length > 1) {
        body = compile(args.nodes[1], {fnParams: params});
      }
      return '(function (' + params.join(',') + ') {return ' + body + '})';
    }
    return callee + compile(node.nodes[1]);
  },
  name: function (node, compile, context) {
    var name = node.value;
    if (context.isFnParams) {
      return name;
    } else if (context.isCallee) {
      if (binaryFunctions[name] || name === 'fn') {
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
