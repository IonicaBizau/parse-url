// Dependencies
const parseUrl = require("../lib");

console.log(parseUrl("http://ionicabizau.net/blog"));
// { protocols: [ 'http' ],
//   protocol: 'http',
//   port: null,
//   resource: 'ionicabizau.net',
//   user: '',
//   pathname: '/blog',
//   hash: '',
//   search: '',
//   href: 'http://ionicabizau.net/blog' }

console.log(parseUrl("http://domain.com/path/name?foo=bar&bar=42#some-hash"));
// { protocols: [ 'http' ],
//   protocol: 'http',
//   port: null,
//   resource: 'domain.com',
//   user: '',
//   pathname: '/path/name',
//   hash: 'some-hash',
//   search: 'foo=bar&bar=42',
//   href: 'http://domain.com/path/name?foo=bar&bar=42#some-hash' }

console.log(parseUrl("git+ssh://git@host.xz/path/name.git"));
// { protocols: [ 'git', 'ssh' ],
//   protocol: 'git',
//   port: null,
//   resource: 'host.xz',
//   user: 'git',
//   pathname: '/path/name.git',
//   hash: '',
//   search: '',
//   href: 'git+ssh://git@host.xz/path/name.git' }

console.log(parseUrl("git@github.com:IonicaBizau/git-stats.git"));
// { protocols: [],
//   protocol: 'ssh',
//   port: null,
//   resource: 'github.com',
//   user: 'git',
//   pathname: '/IonicaBizau/git-stats.git',
//   hash: '',
//   search: '',
//   href: 'git@github.com:IonicaBizau/git-stats.git' }
