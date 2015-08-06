// Dependencies
var Protocols = require("protocols");

/**
 * ParseUrl
 * Parses the input url.
 *
 * @name ParseUrl
 * @function
 * @param {String} url The input url.
 * @return {Object} An object containing the following fields:
 */
function ParseUrl(url) {
    var output = {
            protocols: Protocols(url)
          , port: null
          , resource: ""
          , user: ""
          , pathname: ""
          , hash: ""
          , search: ""
        }
      , protocolIndex = url.indexOf("://")
      , resourceIndex = -1
      , splits = null
      , parts = null
      ;

    if (protocolIndex !== -1) {
        url = url.substring(protocolIndex + 3);
    }

    parts = url.split("/");
    output.resource = parts.shift();

    // user@domain
    splits = output.resource.split("@");
    if (splits.length === 2) {
        output.user = splits[0];
        output.resource = splits[1];
    }


    // domain.com:port
    splits = output.resource.split(":");
    if (splits.length === 2) {
        output.resource = splits[0];
        output.port = parseInt(splits[1]);
        if (isNaN(output.port)) {
            output.port = null;
            parts.unshift(splits[1]);
        }
    }

    // Remove empty elements
    parts = parts.filter(Boolean);

    // Stringify the pathname
    output.pathname = "/" + parts.join("/");

    // ?foo=bar
    splits = output.pathname.split("?");
    if (splits.length === 2) {
        output.pathname = splits[0];
        output.search = splits[1];
    }

    // #some-hash
    splits = output.search.split("#");
    if (splits.length === 2) {
        output.search = splits[0];
        output.hash = splits[1];
    }

    return output;
}

module.exports = ParseUrl;
