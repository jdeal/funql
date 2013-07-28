{
  var makeNode = function (type, value) {
    if (Array.isArray(value)) {
      return {type: type, nodes: value};
    } else {
      return {type: type, value: value};
    }
  }
}

start
  = _ first:item? _ rest:item* {
    if (rest && rest.length > 0) {
      return makeNode('array', [first].concat(rest));
    } else if (first) {
      return first;
    } else {
      return makeNode('empty', null);
    }
  }

item
  = item: (
      object /
      array /
      call /
      string /
      boolean /
      number /
      null /
      identifier
    )

object
  = "{" _ props:objectItem* "}" {
    return makeNode('object', props);
  }

objectItem
  = arg:keyValueArgument _ ","? _ {
    return arg;
  }

array
  = "[" _ items:arrayItem* "]" {
    return makeNode('array', items);
  }

arrayItem
  = arg:item _ ","? _ {
    return arg;
  }

call
  = name:identifier "(" _ keyValueArgs:arguments? _ ")" {
    var args = [];
    var keys = null;
    keyValueArgs = keyValueArgs === '' ? [] : keyValueArgs;
    keyValueArgs.forEach(function (keyValueArg, i) {
      if (keyValueArg.key === null) {
        if (keys) {
          args.push(keys);
        }
        keys = null;
        args.push(keyValueArg.value);
      } else {
        if (!keys) {
          keys = {};
        }
        keys[keyValueArg.key] = keyValueArg.value;
      }
    });
    if (keys) {
      args.push(keys);
    };
    return makeNode('call', [name, makeNode('arguments', args)]);
  }

identifier
  = first:identifierStart rest:identifierChar* {
    return makeNode('name', first + rest.join(''));
  }

identifierKey
  = first:identifierStart rest:identifierChar* {
    return makeNode('string', first + rest.join(''));
  }

identifierStart
  = [a-zA-Z_]

identifierChar
  = [a-zA-Z_0-9]

arguments
  = first:argument rest:(_ ","? _ argument)* {
    var left = [];
    if (first !== '') {
      left = [first];
    }
    var right = [];
    rest.forEach(function (arg) {
      right.push(arg[3]);
    });
    return left.concat(right);
  }

argument
  = (keyValueArgument / plainArgument)

plainArgument
  = arg:item {
    return {key: null, value: arg};
  }

keyValueArgument
  = name:key _ ":" _ value:item {
    return makeNode('property', [name, value]);
  }

key
  = (identifierKey / string)

boolean
  = isTrue: ("true" / "false") {
    return makeNode('boolean', isTrue === 'true' ? true : false);
  }

null
  = name: "null" {
    return makeNode('null', null);
  }

string
  = '"' '"'             { return makeNode('string', ""); }
  / "'" "'"             { return makeNode('string', ""); }
  / '"' chars:dqchars '"' { return makeNode('string', chars); }
  / "'" chars:sqchars "'" { return makeNode('string', chars); }

sqchars
  = chars:sqchar+ { return chars.join(""); }

dqchars
  = chars:dqchar+ { return chars.join(""); }

sqchar
  = [^'\\\0-\x1F\x7f]
  / char

dqchar
  = [^"\\\0-\x1F\x7f]
  / char

char
  = '\\"'  { return '"';  }
  / "\\'"  { return "'";  }
  / "\\\\" { return "\\"; }
  / "\\/"  { return "/";  }
  / "\\b"  { return "\b"; }
  / "\\f"  { return "\f"; }
  / "\\n"  { return "\n"; }
  / "\\r"  { return "\r"; }
  / "\\t"  { return "\t"; }
  / "\\u" h1:hexDigit h2:hexDigit h3:hexDigit h4:hexDigit {
      return String.fromCharCode(parseInt("0x" + h1 + h2 + h3 + h4));
    }

number "number"
  = int_:int frac:frac exp:exp _ { return makeNode('float', parseFloat(int_ + frac + exp)); }
  / int_:int frac:frac _         { return makeNode('float', parseFloat(int_ + frac));       }
  / int_:int exp:exp _           { return makeNode('integer', parseFloat(int_ + exp));        }
  / int_:int _                   { return makeNode('integer', parseFloat(int_));              }

int
  = digit19:digit19 digits:digits     { return digit19 + digits;       }
  / digit:digit
  / "-" digit19:digit19 digits:digits { return "-" + digit19 + digits; }
  / "-" digit:digit                   { return "-" + digit;            }

frac
  = "." digits:digits { return "." + digits; }

exp
  = e:e digits:digits { return e + digits; }

digits
  = digits:digit+ { return digits.join(""); }

e
  = e:[eE] sign:[+-]? { return e + sign; }

digit
  = [0-9]

digit19
  = [1-9]

hexDigit
  = [0-9a-fA-F]

_
  = whitespace*

whitespace
  = [ \t\n\r]