module.exports = {
  call: function (node, compile) {
    return compile(node.nodes[0]) + compile(node.nodes[1]);
  },
  name: function (node, compile) {
    return node.value;
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
    return '[' + compile(node.nodes).join(' ') + ']';
  },
  object: function (node, compile) {
    return '{' + compile(node.nodes).join(' ') + '}';
  },
  property: function (node, compile) {
    return compile(node.nodes[0]) + ':' + compile(node.nodes[1]);
  }
};