var sourceRules = require('./source');

var replaceRules = {
  name: function (node, compile, context) {
    if (context[node.value]) {
      return JSON.stringify(context[node.value]);
    } else {
      return node.value;
    }
  }
};

Object.keys(sourceRules).forEach(function (key) {
  if (!replaceRules[key]) {
    replaceRules[key] = sourceRules[key];
  }
});

module.exports = replaceRules;