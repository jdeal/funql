var quickpeg = require('quickpeg');
var Path = require('path');

var grammarFile = Path.join(__dirname, '../grammar/funql.pegjs');
var parserFile = Path.join(__dirname, '../generated/funql-parser.js');

quickpeg(grammarFile, {cache: parserFile}, function (err, parser) {
  if (err) {
    console.log("ERROR parsing grammar:");
    console.log(err);
  } else {
    console.log("generated parser to", parserFile);
  }
});