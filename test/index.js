// Dependencies
const parseUrl = require("../lib")
    , tester = require("tester")
    , normalizeUrl = require("normalize-url")
    , qs = require("querystring")
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
        "//ionicabizau.net/foo.js"
      , {
            protocols: ["http"]
          , protocol: "http"
          , port: null
          , resource: "ionicabizau.net"
          , user: ""
          , pathname: "/foo.js"
          , hash: ""
          , search: ""
        }
    ]
  , [
        "http://domain.com/path/name#some-hash?foo=bar"
      , {
            protocols: ["http"]
          , protocol: "http"
          , port: null
          , resource: "domain.com"
          , user: ""
          , pathname: "/path/name"
          , hash: "some-hash?foo=bar"
          , search: ""
        }
    ]
  , [
        ["git+ssh://git@host.xz/path/name.git", false]
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
        ["git@github.com:IonicaBizau/git-stats.git", false]
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
  , [
        ["http://ionicabizau.net/with-true-normalize", true]
      , {
            protocols: [ "http" ]
          , protocol: "http"
          , port: null
          , resource: "ionicabizau.net"
          , user: ""
          , pathname: "/with-true-normalize"
          , hash: ""
          , search: ""
        }
    ]
];

tester.describe("check urls", test => {
    INPUTS.forEach(function (c) {
        let url = Array.isArray(c[0]) ? c[0][0] : c[0]
        test.should("support " + url, () => {
            const res = parseUrl(url, c[0][1] !== false);
            if (c[0][1] !== false) {
                url = normalizeUrl(url, {
                    stripHash: false
                })
            }
            c[1].query = qs.parse(c[1].search)
            c[1].href = url
            test.expect(res).toEqual(c[1]);
        });
    });

    test.should("throw if url is empty", () => {
        test.expect(() => {
            parseUrl("")
        }).toThrow(/invalid url/i)
    })
});
