## Documentation

You can see below the API reference of this module.

### `parseUrl(url)`
Parses the input url.

#### Params
- **String** `url`: The input url.

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

