var parser = require('./generated/funql-parser');

// node type hierarchy

// node
//   list
//     call
//     array
//     object
//     property
//     arguments
//   item
//     value
//       boolean
//       number
//         integer
//         float
//       string
//       null
//       empty
//     name

var typeHierarchy = {
  node: ['list', 'item'],
  list: ['call', 'array', 'object', 'property', 'arguments'],
  item: ['value', 'name'],
  value: ['boolean', 'number', 'string', 'null', 'empty'],
  number: ['integer', 'float']
};

var parentTypes = {};

Object.keys(typeHierarchy).forEach(function (type) {
  typeHierarchy[type].forEach(function (childType) {
    parentTypes[childType] = type;
  });
});

var trim = function (str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

var makeCompiler = function (_handlers) {
  var handlers = {};
  Object.keys(_handlers).forEach(function (originalKey) {
    originalKey.split(',').map(function (splitKey) {
      return trim(splitKey);
    }).forEach(function (trimKey) {
      handlers[trimKey] = _handlers[originalKey];
    });
  });
  ['node', 'list', 'item', 'value', 'number'].forEach(function (parentType) {
    if (handlers[parentType]) {
      typeHierarchy[parentType].forEach(function (childType) {
        if (!handlers[childType]) {
          handlers[childType] = handlers[parentType];
        }
      });
    }
  });
  var hasWrapHandler = false;
  if (handlers.wrap_node) {
    hasWrapHandler = true;
  }
  var compileNodes = function (context, canWrap, nodes, extendContext) {
    return nodes.map(function (node) {
      return compileNode(context, canWrap, node, extendContext);
    });
  };
  var compileNode = function (context, canWrap, node, extendContext) {
    if (Array.isArray(node)) {
      return compileNodes(context, canWrap, node, extendContext);
    }
    var suffix = '';
    if (node.type === 'name') {
      suffix = '_' + node.value;
    } else if (node.type === 'call') {
      if (node.nodes[0].type === 'name') {
        suffix = '_' + node.nodes[0].value;
      }
    }
    context = Object.create(context);
    extendContext = extendContext || {};
    Object.keys(extendContext).forEach(function (key) {
      context[key] = extendContext[key];
    });
    var type = node.type;
    if (node.type === 'wrap_root') {
      node = node.nodes[0];
    } else if (canWrap && hasWrapHandler) {
      type = 'wrap_node';
      canWrap = false;
    } else if (!canWrap) {
      canWrap = true;
    }
    if (handlers[type + suffix]) {
      return handlers[type + suffix](node, compileNode.bind(null, context, canWrap), context);
    } else if (handlers[type]) {
      return handlers[type](node, compileNode.bind(null, context, canWrap), context);
    } else if (parentTypes[type] && handlers[parentTypes[type]]) {
      return handlers[parentTypes[type]](node, compileNode.bind(null, context, canWrap), context);
    } else {
      throw new Error('no handler for node type: ' + node.type);
    }
  };

  return function (source, context) {
    var ast;
    if (typeof source === 'string') {
      ast = parser.parse(source);
    } else {
      ast = source;
    }
    context = context || {};
    if (handlers.wrap_root) {
      ast = {
        type: 'wrap_root',
        nodes: [ast]
      };
    }
    return compileNode(context, true, ast, null);
  };
};

var node = function (type, value) {
  if (Array.isArray(value)) {
    return {type: type, nodes: value};
  } else {
    return {type: type, value: value};
  }
};

var sourceCompile = makeCompiler(require('./lib/compilers/source'));
var replaceCompile = makeCompiler(require('./lib/compilers/replace'));
var javascriptCompile = makeCompiler(require('./lib/compilers/javascript'));

module.exports = {
  parse: parser.parse.bind(parser),
  compiler: makeCompiler,
  node: node,
  source: sourceCompile,
  build: replaceCompile,
  toFunction: require('./lib/to-function')(javascriptCompile),
  compilers: {
    source: sourceCompile,
    replace: replaceCompile,
    javascript: javascriptCompile
  }
};
