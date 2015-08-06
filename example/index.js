// Dependencies
var ParseUrl = require("../lib");

console.log(ParseUrl("http://ionicabizau.net/blog"));
// => {
//     protocols: [ "http" ]
//   , port: null
//   , resource: "ionicabizau.net"
//   , user: ""
//   , pathname: "/blog"
//   , hash: ""
//   , search: ""
//   , href: "http://ionicabizau.net/blog"
// }

console.log(ParseUrl("http://domain.com/path/name?foo=bar&bar=42#some-hash"));
// => {
//     protocols: ["http"]
//   , port: null
//   , resource: "domain.com"
//   , user: ""
//   , pathname: "/path/name"
//   , hash: "some-hash"
//   , search: "foo=bar&bar=42"
// }

console.log(ParseUrl("git+ssh://git@host.xz/path/name.git"));
// => {
//     protocols: ["git", "ssh"]
//   , port: null
//   , resource: "host.xz"
//   , user: "git"
//   , pathname: "/path/name.git"
//   , hash: ""
//   , search: ""
// }

console.log(ParseUrl("git@github.com:IonicaBizau/git-stats.git"));
// => {
//     protocols: []
//   , port: null
//   , resource: "github.com"
//   , user: "git"
//   , pathname: "/IonicaBizau/git-stats.git"
//   , hash: ""
//   , search: ""
//   , href: "http://domain.com/path/name?foo=bar&bar=42#some-hash"
// }
