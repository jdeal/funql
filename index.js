var parser = require('./generated/funql-parser');

var makeCompiler = function (handlers) {
  var compileNode = function (context, node, extendContext) {
    var suffix = '';
    if (node.type === 'name') {
      suffix = '_' + node.value;
    } else if (node.type === 'call') {
      if (node.args[0].type === 'name') {
        suffix = '_' + node.args[0].value;
      }
    }
    context = Object.create(context);
    extendContext = extendContext || {};
    Object.keys(extendContext).forEach(function (key) {
      context[key] = extendContext[key];
    });
    if (handlers[node.type + suffix]) {
      return handlers[node.type + suffix](node.args || node.value, compileNode.bind(null, context), context);
    } else if (handlers[node.type]) {
      return handlers[node.type](node.args || node.value, compileNode.bind(null, context), context);
    } else {
      throw new Error('no handler for node type: ' + node.type);
    }
  };

  return function (source) {
    var ast = parser.parse(source);
    return compileNode({}, ast);
  };
};

module.exports = {
  parse: parser.parse.bind(parser),
  compiler: makeCompiler
};