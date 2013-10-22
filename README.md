funql
=====

[![Build Status](https://secure.travis-ci.org/jdeal/funql.png)](http://travis-ci.org/jdeal/funql)

FUNctional Query Language

Funql refers to two things:

1. A minimalist query language that happens to be a superset of JSON.
2. This module which can be used to parse funql syntax and compile that syntax
into various other things.

For the remainder of this document, "funql" will refer to this module, and
"funql syntax" will refer to the query language.

## Installation

### npm

npm install funql

### component

component install jdeal/funql

## Usage

### Parse funql syntax into an AST

```js
var funql = require('funql');

var ast = funql.parse("foo(bar)");
```

### Make an if function compile to a JavaScript if statement

```js
var funql = require('funql');

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

var jsCode = jsCompile("if(x,y,z)");

// jsCode: if (x) {y} else {z}
```
