// Dependencies
var ParseUrl = require("../lib")
  , Assert = require("assert")
  ;

const INPUTS = [
    [
        "http://ionicabizau.net/blog"
      , {
            protocols: [ "http" ]
          , port: null
          , resource: "ionicabizau.net"
          , user: ""
          , pathname: "/blog"
          , hash: ""
          , search: ""
        }
    ]
  , [
        "http://domain.com/path/name?foo=bar&bar=42#some-hash"
      , {
            protocols: ["http"]
          , port: null
          , resource: "domain.com"
          , user: ""
          , pathname: "/path/name"
          , hash: "some-hash"
          , search: "foo=bar&bar=42"
        }
    ]
  , [
        "git+ssh://git@host.xz/path/name.git"
      , {
            protocols: ["git", "ssh"]
          , port: null
          , resource: "host.xz"
          , user: "git"
          , pathname: "/path/name.git"
          , hash: ""
          , search: ""
        }
    ]
  , [
        "git@github.com:IonicaBizau/git-stats.git"
      , {
            protocols: []
          , port: null
          , resource: "github.com"
          , user: "git"
          , pathname: "/IonicaBizau/git-stats.git"
          , hash: ""
          , search: ""
        }
    ]
];

INPUTS.forEach(function (c) {
    it("should support " + c[0], function (cb) {
        Assert.deepEqual(ParseUrl(c[0]), c[1]);
        cb();
    });
});
