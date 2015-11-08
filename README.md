# parse-url [![Support this project][donate-now]][paypal-donations]

An advanced url parser supporting git urls too.

## Installation

```sh
$ npm i parse-url
```

## Example

```js
// Dependencies
var ParseUrl = require("parse-url");

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
//   , href: "http://domain.com/path/name?foo=bar&bar=42#some-hash"
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
//   , href: "git@github.com:IonicaBizau/git-stats.git"
// }
```

## Documentation

### `ParseUrl(url)`
Parses the input url.

#### Params
- **String** `url`: The input url.

#### Return
- **Object** An object containing the following fields:
 - `protocols` (Array): An array with the url protocols (usually it has one element).
 - `port` (null|Number): The domain port.
 - `resource` (String): The url domain (including subdomains).
 - `user` (String): The authentication user (usually for ssh urls).
 - `pathname` (String): The url pathname.
 - `hash` (String): The url hash.
 - `search` (String): The url querystring value.
 - `href` (String): The input url.

## How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

## Where is this library used?
If you are using this library in one of your projects, add it in this list. :sparkles:

 - [`deep-resource`](https://github.com/MitocGroup/deep) by Mitoc Group

 - [`git-up`](https://github.com/IonicaBizau/node-git-up)

 - [`microbe.js`](https://github.com/Aweary/microbe.js) by Brandon Dail

 - [`tumblr-text`](https://npmjs.com/package/tumblr-text) by cobaimelan

## License

[KINDLY][license] © [Ionică Bizău][website]

[license]: http://ionicabizau.github.io/kindly-license/?author=Ionic%C4%83%20Biz%C4%83u%20%3Cbizauionica@gmail.com%3E&year=2015

[website]: http://ionicabizau.net
[paypal-donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVXDDLKKLQRJW
[donate-now]: http://i.imgur.com/6cMbHOC.png

[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md