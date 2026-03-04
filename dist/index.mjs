import parsePath from 'parse-path';

const DATA_URL_DEFAULT_MIME_TYPE = "text/plain";
const DATA_URL_DEFAULT_CHARSET = "us-ascii";
const testParameter = (name, filters) => filters.some((filter) => filter instanceof RegExp ? filter.test(name) : filter === name);
const supportedProtocols = /* @__PURE__ */ new Set([
  "https:",
  "http:",
  "file:"
]);
const hasCustomProtocol = (urlString) => {
  try {
    const { protocol } = new URL(urlString);
    return protocol.endsWith(":") && !protocol.includes(".") && !supportedProtocols.has(protocol);
  } catch {
    return false;
  }
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
  const mimeType = mediaType.shift()?.toLowerCase() ?? "";
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
    ...options
  };
  if (typeof options.defaultProtocol === "string" && !options.defaultProtocol.endsWith(":")) {
    options.defaultProtocol = `${options.defaultProtocol}:`;
  }
  urlString = urlString.trim();
  if (/^data:/i.test(urlString)) {
    return normalizeDataURL(urlString, options);
  }
  if (hasCustomProtocol(urlString)) {
    return urlString;
  }
  const hasRelativeProtocol = urlString.startsWith("//");
  const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);
  if (!isRelativeUrl) {
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
      result += intermediate.replace(/\/{2,}/g, "/");
      result += protocol;
      lastIndex = protocolAtIndex + protocol.length;
    }
    const remnant = urlObject.pathname.slice(lastIndex, urlObject.pathname.length);
    result += remnant.replace(/\/{2,}/g, "/");
    urlObject.pathname = result;
  }
  if (urlObject.pathname) {
    try {
      urlObject.pathname = decodeURI(urlObject.pathname).replace(/\\/g, "%5C");
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
  if (Array.isArray(options.removeQueryParameters)) {
    for (const key of [...urlObject.searchParams.keys()]) {
      if (testParameter(key, options.removeQueryParameters)) {
        urlObject.searchParams.delete(key);
      }
    }
  }
  if (!Array.isArray(options.keepQueryParameters) && options.removeQueryParameters === true) {
    urlObject.search = "";
  }
  if (Array.isArray(options.keepQueryParameters) && options.keepQueryParameters.length > 0) {
    for (const key of [...urlObject.searchParams.keys()]) {
      if (!testParameter(key, options.keepQueryParameters)) {
        urlObject.searchParams.delete(key);
      }
    }
  }
  if (options.sortQueryParameters) {
    const originalSearch = urlObject.search;
    urlObject.searchParams.sort();
    try {
      urlObject.search = decodeURIComponent(urlObject.search);
    } catch {
    }
    const partsWithoutEquals = originalSearch.slice(1).split("&").filter((p) => p && !p.includes("="));
    for (const part of partsWithoutEquals) {
      const decoded = decodeURIComponent(part);
      urlObject.search = urlObject.search.replace(`?${decoded}=`, `?${decoded}`).replace(`&${decoded}=`, `&${decoded}`);
    }
  }
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

/*!
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
    const matched = parsed.href.match(GIT_RE);
    if (matched) {
      parsed.protocols = ["ssh"];
      parsed.protocol = "ssh";
      parsed.resource = matched[2];
      parsed.host = matched[2];
      parsed.user = matched[1];
      parsed.pathname = `/${matched[3]}`;
      parsed.parse_failed = false;
    } else {
      throwErr("URL parsing failed.");
    }
  }
  return parsed;
};
parseUrl.MAX_INPUT_LENGTH = 2048;

export { parseUrl as default };
