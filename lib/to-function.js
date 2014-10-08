var toArray = function (arguments) {
  return Array.prototype.slice.call(arguments, 0);
};

var methodFunction = function (name) {
  return function (obj) {
    var args = toArray(arguments).slice(1);
    return obj[name].apply(obj, args);
  };
};

var propFunction = function (name) {
  return function (obj) {
    return obj[name];
  };
};

var globalFnMap = {
  abs: Math.abs,
  max: Math.max,
  min: Math.min,
  round: Math.round,
  pow: Math.pow,
  sqrt: Math.sqrt,

  slice: methodFunction('slice'),
  concat: methodFunction('concat'),
  indexOf: methodFunction('indexOf'),
  lastIndexOf: methodFunction('lastIndexOf'),
  replace: methodFunction('replace'),
  split: methodFunction('split'),
  substr: methodFunction('substr'),
  substring: methodFunction('substring'),
  toLowerCase: methodFunction('toLowerCase'),
  toUpperCase: methodFunction('toUpperCase'),
  trim: methodFunction('trim'),
  trimLeft: methodFunction('trimLeft'),
  trimRight: methodFunction('trimRight'),
  join: methodFunction('join'),
  reverse: methodFunction('reverse'),

  length: propFunction('length'),

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
