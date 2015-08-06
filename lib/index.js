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
 *
 *  - `protocols` (Array): An array with the url protocols (usually it has one element).
 *  - `port` (null|Number): The domain port.
 *  - `resource` (String): The url domain (including subdomains).
 *  - `user` (String): The authentication user (usually for ssh urls).
 *  - `pathname` (String): The url pathname.
 *  - `hash` (String): The url hash.
 *  - `search` (String): The url querystring value.
 *  - `href` (String): The input url.
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
          , href: url
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

    // #some-hash
    splits = output.pathname.split("#");
    if (splits.length === 2) {
        output.pathname = splits[0];
        output.hash = splits[1];
    }

    // ?foo=bar
    splits = output.pathname.split("?");
    if (splits.length === 2) {
        output.pathname = splits[0];
        output.search = splits[1];
    }

    return output;
}

module.exports = ParseUrl;
