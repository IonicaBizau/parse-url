## Documentation

You can see below the API reference of this module.

### `interopDefaultLegacy()`
#__PURE__

### `parseUrl(url, normalize)`
Parses the input url.

**Note**: This *throws* if invalid urls are provided.

#### Params

- **String** `url`: The input url.
- **Boolean|Object** `normalize`: Whether to normalize the url or not.                         Default is `false`. If `true`, the url will
                        be normalized. If an object, it will be the
                        options object sent to [`normalize-url`](https://github.com/sindresorhus/normalize-url).

                        For SSH urls, normalize won't work.

#### Return
- **Object** An object containing the following fields:
   - `protocols` (Array): An array with the url protocols (usually it has one element).
   - `protocol` (String): The first protocol, `"ssh"` (if the url is a ssh url) or `"file"`.
   - `port` (null|Number): The domain port.
   - `resource` (String): The url domain (including subdomains).
   - `user` (String): The authentication user (usually for ssh urls).
   - `pathname` (String): The url pathname.
   - `hash` (String): The url hash.
   - `search` (String): The url querystring value.
   - `href` (String): The input url.
   - `query` (Object): The url querystring, parsed as object.
   - `parse_failed` (Boolean): Whether the parsing failed or not.

