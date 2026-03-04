'use strict';

var parsePath = require('parse-path');

const DATA_URL_DEFAULT_MIME_TYPE = "text/plain";
const DATA_URL_DEFAULT_CHARSET = "us-ascii";
const encodedReservedCharactersPattern = "%(?:3A|2F|3F|23|5B|5D|40|21|24|26|27|28|29|2A|2B|2C|3B|3D)";
const temporaryEncodedReservedTokenBase = "__normalize_url_encoded_reserved__";
const temporaryEncodedReservedTokenPattern = /__normalize_url_encoded_reserved__(\d+)__/g;
const hasEncodedReservedCharactersRegex = new RegExp(encodedReservedCharactersPattern, "i");
const encodedReservedCharactersRegex = new RegExp(encodedReservedCharactersPattern, "gi");
const testParameter = (name, filters) => Array.isArray(filters) && filters.some((filter) => {
  if (filter instanceof RegExp) {
    if (filter.flags.includes("g") || filter.flags.includes("y")) {
      return new RegExp(filter.source, filter.flags.replaceAll(/[gy]/g, "")).test(name);
    }
    return filter.test(name);
  }
  return filter === name;
});
const supportedProtocols = /* @__PURE__ */ new Set([
  "https:",
  "http:",
  "file:"
]);
const normalizeCustomProtocolOption = (protocol) => {
  if (typeof protocol !== "string") {
    return void 0;
  }
  const normalizedProtocol = protocol.trim().toLowerCase().replace(/:$/, "");
  return normalizedProtocol === "" ? void 0 : `${normalizedProtocol}:`;
};
const getCustomProtocol = (urlString) => {
  try {
    const { protocol } = new URL(urlString);
    const hasAuthority = urlString.slice(0, protocol.length + 2).toLowerCase() === `${protocol}//`;
    if (protocol.endsWith(":") && (!protocol.includes(".") || hasAuthority) && !supportedProtocols.has(protocol)) {
      return protocol;
    }
  } catch {
  }
  return void 0;
};
const decodeQueryKey = (value) => {
  try {
    return decodeURIComponent(value.replaceAll("+", "%20"));
  } catch {
    return new URLSearchParams(`${value}=`).keys().next().value;
  }
};
const getKeysWithoutEquals = (search) => {
  const keys = /* @__PURE__ */ new Set();
  if (!search) {
    return keys;
  }
  for (const part of search.slice(1).split("&")) {
    if (part && !part.includes("=")) {
      keys.add(decodeQueryKey(part));
    }
  }
  return keys;
};
const getTemporaryEncodedReservedTokenPrefix = (search) => {
  let decodedSearch = search;
  try {
    decodedSearch = decodeURIComponent(search);
  } catch {
    decodedSearch = new URLSearchParams(search).toString();
  }
  const getUsedTokenIndexes = (value) => {
    const indexes = /* @__PURE__ */ new Set();
    for (const match of value.matchAll(temporaryEncodedReservedTokenPattern)) {
      indexes.add(Number.parseInt(match[1], 10));
    }
    return indexes;
  };
  const usedTokenIndexes = getUsedTokenIndexes(search);
  for (const tokenIndex2 of getUsedTokenIndexes(decodedSearch)) {
    usedTokenIndexes.add(tokenIndex2);
  }
  let tokenIndex = 0;
  while (usedTokenIndexes.has(tokenIndex)) {
    tokenIndex++;
  }
  return `${temporaryEncodedReservedTokenBase}${tokenIndex}__`;
};
const sortSearchParameters = (searchParameters, encodedReservedTokenRegex) => {
  if (!encodedReservedTokenRegex) {
    searchParameters.sort();
    return searchParameters.toString();
  }
  const getSortableKey = (key) => key.replace(encodedReservedTokenRegex, (_, hexCode) => String.fromCodePoint(Number.parseInt(hexCode, 16)));
  const entries = [...searchParameters.entries()];
  entries.sort(([leftKey], [rightKey]) => {
    const left = getSortableKey(leftKey);
    const right = getSortableKey(rightKey);
    return left < right ? -1 : left > right ? 1 : 0;
  });
  return new URLSearchParams(entries).toString();
};
const decodeReservedTokens = (value, encodedReservedTokenRegex) => {
  if (!encodedReservedTokenRegex) {
    return value;
  }
  return value.replace(encodedReservedTokenRegex, (_, hexCode) => String.fromCodePoint(Number.parseInt(hexCode, 16)));
};
const normalizeEmptyQueryParameters = (search, emptyQueryValue, originalSearch) => {
  const isAlways = emptyQueryValue === "always";
  const isNever = emptyQueryValue === "never";
  const keysWithoutEquals = isAlways || isNever ? void 0 : getKeysWithoutEquals(originalSearch);
  const normalizeKey = (key) => key.replaceAll("+", "%20");
  const formatEmptyValue = (normalizedKey) => {
    if (isAlways) {
      return `${normalizedKey}=`;
    }
    if (isNever) {
      return normalizedKey;
    }
    return keysWithoutEquals.has(decodeQueryKey(normalizedKey)) ? normalizedKey : `${normalizedKey}=`;
  };
  const normalizeParameter = (parameter) => {
    const equalIndex = parameter.indexOf("=");
    if (equalIndex === -1) {
      return formatEmptyValue(normalizeKey(parameter));
    }
    const key = parameter.slice(0, equalIndex);
    const value = parameter.slice(equalIndex + 1);
    if (value === "") {
      if (key === "") {
        return "=";
      }
      return formatEmptyValue(normalizeKey(key));
    }
    return `${normalizeKey(key)}=${value}`;
  };
  const parameters = search.slice(1).split("&").filter(Boolean);
  return parameters.length === 0 ? "" : `?${parameters.map((x) => normalizeParameter(x)).join("&")}`;
};
const normalizeDataURL = (urlString, { stripHash }) => {
  const match = /^data:(?<type>[^,]*?),(?<data>[^#]*?)(?:#(?<hash>.*))?$/.exec(urlString);
  if (!match) {
    throw new Error(`Invalid URL: ${urlString}`);
  }
  const { type, data, hash } = match.groups;
  const mediaType = type.split(";");
  const isBase64 = mediaType.at(-1) === "base64";
  if (isBase64) {
    mediaType.pop();
  }
  const mimeType = mediaType.shift().toLowerCase();
  const attributes = mediaType.map((attribute) => {
    let [key, value = ""] = attribute.split("=").map((string) => string.trim());
    if (key === "charset") {
      value = value.toLowerCase();
      if (value === DATA_URL_DEFAULT_CHARSET) {
        return "";
      }
    }
    return `${key}${value ? `=${value}` : ""}`;
  }).filter(Boolean);
  const normalizedMediaType = [...attributes];
  if (isBase64) {
    normalizedMediaType.push("base64");
  }
  if (normalizedMediaType.length > 0 || mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE) {
    normalizedMediaType.unshift(mimeType);
  }
  const hashPart = stripHash || !hash ? "" : `#${hash}`;
  return `data:${normalizedMediaType.join(";")},${isBase64 ? data.trim() : data}${hashPart}`;
};
function normalizeUrl(urlString, options) {
  options = {
    defaultProtocol: "http",
    normalizeProtocol: true,
    forceHttp: false,
    forceHttps: false,
    stripAuthentication: true,
    stripHash: false,
    stripTextFragment: true,
    stripWWW: true,
    removeQueryParameters: [/^utm_\w+/i],
    removeTrailingSlash: true,
    removeSingleSlash: true,
    removeDirectoryIndex: false,
    removeExplicitPort: false,
    sortQueryParameters: true,
    removePath: false,
    transformPath: false,
    emptyQueryValue: "preserve",
    ...options
  };
  if (typeof options.defaultProtocol === "string" && !options.defaultProtocol.endsWith(":")) {
    options.defaultProtocol = `${options.defaultProtocol}:`;
  }
  urlString = urlString.trim();
  if (/^data:/i.test(urlString)) {
    return normalizeDataURL(urlString, options);
  }
  const customProtocols = Array.isArray(options.customProtocols) ? options.customProtocols : [];
  const normalizedCustomProtocols = new Set(customProtocols.map((protocol) => normalizeCustomProtocolOption(protocol)).filter(Boolean));
  const customProtocol = getCustomProtocol(urlString);
  if (customProtocol && !normalizedCustomProtocols.has(customProtocol)) {
    return urlString;
  }
  const hasRelativeProtocol = urlString.startsWith("//");
  const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);
  if (!isRelativeUrl && !customProtocol) {
    urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
  }
  const urlObject = new URL(urlString);
  if (options.forceHttp && options.forceHttps) {
    throw new Error("The `forceHttp` and `forceHttps` options cannot be used together");
  }
  if (options.forceHttp && urlObject.protocol === "https:") {
    urlObject.protocol = "http:";
  }
  if (options.forceHttps && urlObject.protocol === "http:") {
    urlObject.protocol = "https:";
  }
  if (options.stripAuthentication) {
    urlObject.username = "";
    urlObject.password = "";
  }
  if (options.stripHash) {
    urlObject.hash = "";
  } else if (options.stripTextFragment) {
    urlObject.hash = urlObject.hash.replace(/#?:~:text.*?$/i, "");
  }
  if (urlObject.pathname) {
    const protocolRegex = /\b[a-z][a-z\d+\-.]{1,50}:\/\//g;
    let lastIndex = 0;
    let result = "";
    for (; ; ) {
      const match = protocolRegex.exec(urlObject.pathname);
      if (!match) {
        break;
      }
      const protocol = match[0];
      const protocolAtIndex = match.index;
      const intermediate = urlObject.pathname.slice(lastIndex, protocolAtIndex);
      result += intermediate.replaceAll(/\/{2,}/g, "/");
      result += protocol;
      lastIndex = protocolAtIndex + protocol.length;
    }
    const remnant = urlObject.pathname.slice(lastIndex);
    result += remnant.replaceAll(/\/{2,}/g, "/");
    urlObject.pathname = result;
  }
  if (urlObject.pathname) {
    try {
      urlObject.pathname = decodeURI(urlObject.pathname).replaceAll("\\", "%5C");
    } catch {
    }
  }
  if (options.removeDirectoryIndex === true) {
    options.removeDirectoryIndex = [/^index\.[a-z]+$/];
  }
  if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
    const pathComponents = urlObject.pathname.split("/").filter(Boolean);
    const lastComponent = pathComponents.at(-1);
    if (lastComponent && testParameter(lastComponent, options.removeDirectoryIndex)) {
      pathComponents.pop();
      urlObject.pathname = pathComponents.length > 0 ? `/${pathComponents.join("/")}/` : "/";
    }
  }
  if (options.removePath) {
    urlObject.pathname = "/";
  }
  if (options.transformPath && typeof options.transformPath === "function") {
    const pathComponents = urlObject.pathname.split("/").filter(Boolean);
    const newComponents = options.transformPath(pathComponents);
    urlObject.pathname = newComponents?.length > 0 ? `/${newComponents.join("/")}` : "/";
  }
  if (urlObject.hostname) {
    urlObject.hostname = urlObject.hostname.replace(/\.$/, "");
    if (options.stripWWW && /^www\.(?!www\.)[a-z\-\d]{1,63}\.[a-z.\-\d]{2,63}$/.test(urlObject.hostname)) {
      urlObject.hostname = urlObject.hostname.replace(/^www\./, "");
    }
  }
  const originalSearch = urlObject.search;
  let encodedReservedTokenRegex;
  if (options.sortQueryParameters && hasEncodedReservedCharactersRegex.test(originalSearch)) {
    const encodedReservedTokenPrefix = getTemporaryEncodedReservedTokenPrefix(originalSearch);
    urlObject.search = originalSearch.replaceAll(encodedReservedCharactersRegex, (match) => `${encodedReservedTokenPrefix}${match.slice(1).toUpperCase()}`);
    encodedReservedTokenRegex = new RegExp(`${encodedReservedTokenPrefix}([0-9A-F]{2})`, "g");
  }
  const hasKeepQueryParameters = Array.isArray(options.keepQueryParameters);
  const { searchParams } = urlObject;
  if (!hasKeepQueryParameters && Array.isArray(options.removeQueryParameters) && options.removeQueryParameters.length > 0) {
    for (const key of [...searchParams.keys()]) {
      if (testParameter(decodeReservedTokens(key, encodedReservedTokenRegex), options.removeQueryParameters)) {
        searchParams.delete(key);
      }
    }
  }
  if (!hasKeepQueryParameters && options.removeQueryParameters === true) {
    urlObject.search = "";
  }
  if (hasKeepQueryParameters && options.keepQueryParameters.length > 0) {
    for (const key of [...searchParams.keys()]) {
      if (!testParameter(decodeReservedTokens(key, encodedReservedTokenRegex), options.keepQueryParameters)) {
        searchParams.delete(key);
      }
    }
  } else if (hasKeepQueryParameters) {
    urlObject.search = "";
  }
  if (options.sortQueryParameters) {
    urlObject.search = sortSearchParameters(urlObject.searchParams, encodedReservedTokenRegex);
    urlObject.search = decodeURIComponent(urlObject.search.replaceAll(/%(?:26|23|3f|25|2b)/gi, (match) => `%25${match.slice(1)}`));
    if (encodedReservedTokenRegex) {
      urlObject.search = urlObject.search.replace(encodedReservedTokenRegex, "%$1");
    }
  }
  urlObject.search = normalizeEmptyQueryParameters(urlObject.search, options.emptyQueryValue, originalSearch);
  if (options.removeTrailingSlash) {
    urlObject.pathname = urlObject.pathname.replace(/\/$/, "");
  }
  if (options.removeExplicitPort && urlObject.port) {
    urlObject.port = "";
  }
  const oldUrlString = urlString;
  urlString = urlObject.toString();
  if (!options.removeSingleSlash && urlObject.pathname === "/" && !oldUrlString.endsWith("/") && urlObject.hash === "") {
    urlString = urlString.replace(/\/$/, "");
  }
  if ((options.removeTrailingSlash || urlObject.pathname === "/") && urlObject.hash === "" && options.removeSingleSlash) {
    urlString = urlString.replace(/\/$/, "");
  }
  if (hasRelativeProtocol && !options.normalizeProtocol) {
    urlString = urlString.replace(/^http:\/\//, "//");
  }
  if (options.stripProtocol) {
    urlString = urlString.replace(/^(?:https?:)?\/\//, "");
  }
  return urlString;
}

/**
 * parseUrl
 * Parses the input url.
 *
 * **Note**: This *throws* if invalid urls are provided.
 *
 * @name parseUrl
 * @function
 * @param {String} url The input url.
 * @param {Boolean|Object} normalize Whether to normalize the url or not.
 * Default is `false`. If `true`, the url will be normalized. If an object,
 * it will be the options object sent to
 * [`normalize-url`](https://github.com/sindresorhus/normalize-url). For
 * SSH urls, normalize won't work.
 *
 * @return {Object} An object containing the following fields:
 *
 *    - `protocols` (Array): An array with the url protocols (usually it has one element).
 *    - `protocol` (String): The first protocol, `"ssh"` (if the url is a ssh url) or `"file"`.
 *    - `port` (String): The domain port.
 *    - `resource` (String): The url domain (including subdomains).
 *    - `host` (String):  The fully qualified domain name of a network host, or its IP address.
 *    - `user` (String): The authentication user (usually for ssh urls).
 *    - `pathname` (String): The url pathname.
 *    - `hash` (String): The url hash.
 *    - `search` (String): The url querystring value.
 *    - `href` (String): The input url.
 *    - `query` (Object): The url querystring, parsed as object.
 *    - `parse_failed` (Boolean): Whether the parsing failed or not.
 */
const parseUrl = (url, normalize = false) => {
  const GIT_RE = /^(?:([a-zA-Z_][a-zA-Z0-9_-]{0,31})@|https?:\/\/)([\w\.\-@]+)[\/:](([\~,\.\w,\-,\_,\/,\s]|%[0-9A-Fa-f]{2})+?(?:\.git|\/)?)$/;
  const throwErr = (msg) => {
    const err = new Error(msg);
    err.subject_url = url;
    throw err;
  };
  if (typeof url !== "string" || !url.trim()) {
    throwErr("Invalid url.");
  }
  if (url.length > parseUrl.MAX_INPUT_LENGTH) {
    throwErr("Input exceeds maximum length. If needed, change the value of parseUrl.MAX_INPUT_LENGTH.");
  }
  if (normalize) {
    if (typeof normalize !== "object") {
      normalize = {
        stripHash: false
      };
    }
    url = normalizeUrl(url, normalize);
  }
  const parsed = parsePath(url);
  if (parsed.parse_failed) {
    let hash = "";
    let hrefWithoutHash = parsed.href;
    const hashIndex = parsed.href.indexOf("#");
    if (hashIndex !== -1) {
      hash = parsed.href.slice(hashIndex + 1);
      hrefWithoutHash = parsed.href.slice(0, hashIndex);
    }
    const matched = hrefWithoutHash.match(GIT_RE);
    if (matched) {
      parsed.protocols = ["ssh"];
      parsed.protocol = "ssh";
      parsed.resource = matched[2];
      parsed.host = matched[2];
      parsed.user = matched[1];
      parsed.pathname = `/${matched[3]}`;
      parsed.parse_failed = false;
      parsed.hash = hash;
      if (hash) {
        parsed.href = `${hrefWithoutHash}#${hash}`;
      }
    } else {
      throwErr("URL parsing failed.");
    }
  }
  return parsed;
};
parseUrl.MAX_INPUT_LENGTH = 2048;

module.exports = parseUrl;
