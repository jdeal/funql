var globalFnMap = {
  abs: Math.abs,
  max: Math.max,
  min: Math.min,

  sum: function () {
    var sum = 0;
    for (var i = 0; i < arguments.length; i++) {
      sum += arguments[i];
    }
    return sum;
  }
};

toFunction = function (javascriptCompile, source, fnMap) {
  fnMap = fnMap || {};
  var fullFnMap = {};
  Object.keys(globalFnMap).forEach(function (key) {
    fullFnMap[key] = globalFnMap[key];
  });
  Object.keys(fnMap).forEach(function (key) {
    var fn = fnMap[key];
    if (typeof fn === 'function') {
      fullFnMap[key] = fn;
    }
  });
  var expression = javascriptCompile(source);
  return new Function('functions', 'context', 'return ' + expression).bind(null, fullFnMap);
};

module.exports = function (javascriptCompile) {
  return toFunction.bind(null, javascriptCompile);
};
