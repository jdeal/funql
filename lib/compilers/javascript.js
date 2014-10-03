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
    }
    return callee + compile(node.nodes[1]);
  },
  name: function (node, compile, context) {
    var name = node.value;
    if (context.isCallee) {
      if (binaryFunctions[name]) {
        return name;
      } else {
        return 'functions.' + name;
      }
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
