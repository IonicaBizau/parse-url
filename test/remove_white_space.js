const parser = require('../lib/index.js');
console.log(parser("\x00javascript:alert(1)"))
console.log(parser("\bjavascript:alert(1)"))
