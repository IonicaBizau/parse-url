"use strict"

const parsePath = require("parse-path")
    , normalizeUrl = require("normalize-url")

/**
 * parseUrl
 * Parses the input url.
 *
 * **Note**: This *throws* if invalid urls are provided.
 *
 * @name parseUrl
 * @function
 * @param {String} url The input url.
 * @param {Boolean|Object} normalize Wheter to normalize the url or not.
 *                         Default is `false`. If `true`, the url will
 *                         be normalized. If an object, it will be the
 *                         options object sent to [`normalize-url`](https://github.com/sindresorhus/normalize-url).
 *
 *                         For SSH urls, normalize won't work.
 *
 * @return {Object} An object containing the following fields:
 *
 *  - `protocols` (Array): An array with the url protocols (usually it has one element).
 *  - `protocol` (String): The first protocol, `"ssh"` (if the url is a ssh url) or `"file"`.
 *  - `port` (null|Number): The domain port.
 *  - `resource` (String): The url domain (including subdomains).
 *  - `user` (String): The authentication user (usually for ssh urls).
 *  - `pathname` (String): The url pathname.
 *  - `hash` (String): The url hash.
 *  - `search` (String): The url querystring value.
 *  - `href` (String): The input url.
 *  - `query` (Object): The url querystring, parsed as object.
 */
function remove_whitespace(url){
    const whitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/;
    url = url.replace(whitespace, '')
    return url
}

function javascript_check(url){
    return new URL(url).protocol.replace(':', '') == 'javascript'
}

function parseUrl(url, normalize = false) {
    if (typeof url !== "string" || !url.trim()) {
        throw new Error("Invalid url.")
    }

    url = remove_whitespace(url)
    const js_check = javascript_check(url)
    const js_inv_check = url.substring(url.indexOf(':'), url.indexOf(':') + 3) == '://'

    if (js_check){
        url = (url.substring(0, url.indexOf(':')) == 'javascript' && js_inv_check 
        ? url : [url.slice(0, url.indexOf(':')+1), '///', url.slice(url.indexOf(':')+1)].join(''))
    }

    if (normalize) {
        if (typeof normalize !== "object") {
            normalize = {
                stripHash: false
            }
        }
        url = normalizeUrl(url, normalize)
    }

    let parse = parsePath(url)
    if(js_inv_check !== true? parse['href'] = [url.slice(0, url.indexOf(':///')+1), url.slice(url.indexOf(':///')+4)].join('') :
        parse
    )
    return parse
}

module.exports = parseUrl;