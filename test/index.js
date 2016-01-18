// Dependencies
const parseUrl = require("../lib")
    , tester = require("tester")
    ;

const INPUTS = [
    [
        "http://ionicabizau.net/blog"
      , {
            protocols: [ "http" ]
          , protocol: "http"
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
          , protocol: "http"
          , port: null
          , resource: "domain.com"
          , user: ""
          , pathname: "/path/name"
          , hash: "some-hash"
          , search: "foo=bar&bar=42"
        }
    ]
  , [
        "http://domain.com/path/name#some-hash?foo=bar&bar=42"
      , {
            protocols: ["http"]
          , protocol: "http"
          , port: null
          , resource: "domain.com"
          , user: ""
          , pathname: "/path/name"
          , hash: "some-hash?foo=bar&bar=42"
          , search: ""
        }
    ]
  , [
        "git+ssh://git@host.xz/path/name.git"
      , {
            protocols: ["git", "ssh"]
          , protocol: "git"
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
          , protocol: "ssh"
          , port: null
          , resource: "github.com"
          , user: "git"
          , pathname: "/IonicaBizau/git-stats.git"
          , hash: ""
          , search: ""
        }
    ]
];

tester.describe("check urls", test => {
    INPUTS.forEach(function (c) {
        test.should("support " + c[0], () => {
            c[1].href = c[0];
            test.expect(parseUrl(c[0])).toEqual(c[1]);
        });
    });
});
