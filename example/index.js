// Dependencies
import parseUrl from "../lib/index.js";

console.log(parseUrl("http://ionicabizau.net/blog"))
// {
//   protocols: [ 'http' ],
//   protocol: 'http',
//   port: '',
//   resource: 'ionicabizau.net',
//   user: '',
//   password: '',
//   pathname: '/blog',
//   hash: '',
//   search: '',
//   href: 'http://ionicabizau.net/blog',
//   query: {}
// }

console.log(parseUrl("http://domain.com/path/name?foo=bar&bar=42#some-hash"))
// {
//   protocols: [ 'http' ],
//   protocol: 'http',
//   port: '',
//   resource: 'domain.com',
//   user: '',
//   password: '',
//   pathname: '/path/name',
//   hash: 'some-hash',
//   search: 'foo=bar&bar=42',
//   href: 'http://domain.com/path/name?foo=bar&bar=42#some-hash',
//   query: { foo: 'bar', bar: '42' }
// }

// If you want to parse fancy Git urls, turn off the automatic url normalization
console.log(parseUrl("git+ssh://git@host.xz/path/name.git", false))
// {
//   protocols: [ 'git', 'ssh' ],
//   protocol: 'git',
//   port: '',
//   resource: 'host.xz',
//   user: 'git',
//   password: '',
//   pathname: '/path/name.git',
//   hash: '',
//   search: '',
//   href: 'git+ssh://git@host.xz/path/name.git',
//   query: {}
// }

console.log(parseUrl("git@github.com:IonicaBizau/git-stats.git", false))
// {
//   protocols: [ 'ssh' ],
//   protocol: 'ssh',
//   port: '',
//   resource: 'github.com',
//   user: 'git',
//   password: '',
//   pathname: '/IonicaBizau/git-stats.git',
//   hash: '',
//   search: '',
//   href: 'git@github.com:IonicaBizau/git-stats.git',
//   query: {}
// }
