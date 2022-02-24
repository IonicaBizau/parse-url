const parser = require('../lib/index.js');

console.log("[+] Test Case - 1")
console.log(parser("javascript://alert(1)"))

console.log("Test Case - 2")
console.log(parser("javascript:alert(1)"))

console.log("Test Case - 3")
console.log(parser("j\x61vascript:alert(1)"))

console.log("Test Case - 4")
console.log(parser("\x00javascript:alert(1)"))

/*
[+] Test Case - 1
{
  protocols: [ 'javascript' ],
  protocol: 'javascript',
  port: null,
  resource: 'alert(1)',
  user: '',
  pathname: '',
  hash: '',
  search: '',
  href: 'javascript://alert(1)',
  query: [Object: null prototype] {}
}
Test Case - 2
{
  protocols: [ 'javascript' ],
  protocol: 'javascript',
  port: null,
  resource: '',
  user: '',
  pathname: '/alert(1)',
  hash: '',
  search: '',
  href: 'javascript:alert(1)',
  query: [Object: null prototype] {}
}
Test Case - 3
{
  protocols: [ 'javascript' ],
  protocol: 'javascript',
  port: null,
  resource: '',
  user: '',
  pathname: '/alert(1)',
  hash: '',
  search: '',
  href: 'javascript:alert(1)',
  query: [Object: null prototype] {}
}
Test Case - 4
{
  protocols: [ 'javascript' ],
  protocol: 'javascript',
  port: null,
  resource: '',
  user: '',
  pathname: '/alert(1)',
  hash: '',
  search: '',
  href: 'javascript:alert(1)',
  query: [Object: null prototype] {}
}
*/