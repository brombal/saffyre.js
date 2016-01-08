# Saffyre.js

Saffyre is a middleware plugin for Express that maps a directory containing JavaScript files
to Express routes. This allows you to separate related routes into files and not have to
manually maintain a list of files that need to be included.

Saffyre creates routes for every file in the directory based on the files' paths. For
example, a file named `account/settings.js` would map to the url path `account/settings`.
Any routes you define in `settings.js` would be mapped relative to this url. The whole url
is relative to whatever prefix you specify when you add the Saffyre middleware to your
Express app.

## Getting Started

Install via npm:

```bash
$ npm install --save saffyre
```

If you haven't already, create your Express `app.js` file, and then register the `saffyre`
middleware:

```js
// app.js:

var app = require('express')();
var saffyre = require('./saffyre');

app.use(saffyre(__dirname + '/routes'));

app.listen(8080, function() {
	console.log('Listening...');
});
```

The `saffyre` method takes a directory path where it should look for files, and an optional
second parameter of options (see below for details).

Create the directory named `routes` (or whatever you chose to specify when you initialized
Saffyre). Then add some files to it - the filename and path will become the url prefix
that maps to that file.

```
File:                           URL Path prefix:
- routes/
    - about.js                  /about
    - home.js                   /home
    - account/
        - settings.js           /account/settings
        - home.js               /account/home
etc...
```

In all of these files, create an `express.Router` instance and set it to `module.exports`.
Any routes you create on this Router instance will be mapped relative to the file's url
prefix.

For example:

```js
// /account/settings.js:

var router = require('express').Router();

router.get('/', function(req, res) {
    res.send('This is /account/settings/');
});

router.post('/save', function(req, res) {
    res.send('This is /account/settings/save');
});

module.exports = router;
```

You can see from the responses how the paths are mapped to url paths.



## Special Filenames

There are two filenames that provide special functionality: **_default.js** and
**_global.js**.

### _default.js

This file is used for requests that have a url path prefix matching only a folder name. It
is essentially a "no name" file. Just like the url `/home` would map to `/home.js`, `/` will map
to `/_default.js`.

This is useful for creating a homepage route or creating a route for a directory that also
contains other files. In the folder structure example above, the addition of `/_default.js`
and `/account/_default.js` would allow the url paths `/` and `/account` to map to distinct
files.

### _global.js

This file provides a convenient way to add more middleware to a subset of url prefixes.
The Express middleware method (ie. `function(req, res, next)`) that a `_global.js` file
exports will be executed for all requests that have a url prefix matching the global file's
path.

For example, `/_global.js` will be executed before **all** requests that Saffyre handles, and
`/account/_global.js` will be executed before any request that has a url prefix of
`/account`. All `_global.js` middleware is executed starting with the deepest file first,
working up the directory structure.



## API

The Saffyre module returns a function with the following signature:

```js
saffyre(path, options)
```

The return value of this method is an `express.Router` instance that can be used as
middleware.

- `path` is the directory containing files that you want to map to url prefixes. This can
  be an absolute directory or relative to the current working directory.

- `options` is an object containing configuration options for Saffyre:

    - `watch: true|false` - Watch the directory for changes. This is useful in
      development when you want to make changes to route logic without needing to restart
      your web application.


The `express.Router` instance can be registered using Express's `app.use()` method,
for example:

```js
app.use(saffyre('routes', { watch: true }));

// Or, you can map the entire middleware to a prefix.
// All registered files will be relative to the specified url path:
app.use('saffyre/', saffyre('routes', { watch: true }));
```

