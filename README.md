# Serve-SPA

[Express](http://expressjs.com) middleware to serve Single Page Applications in a performant and Google-friendly way

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/analog-nico/serve-spa?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Linux: [![Linux Build Status](https://travis-ci.org/analog-nico/serve-spa.svg?branch=master)](https://travis-ci.org/analog-nico/serve-spa) [![Coverage Status](https://coveralls.io/repos/analog-nico/serve-spa/badge.png)](https://coveralls.io/r/analog-nico/serve-spa?branch=master) Windows: [![Windows Build Status](https://ci.appveyor.com/api/projects/status/b6ps2l9im3rr6eqh/branch/master?svg=true)](https://ci.appveyor.com/project/analog-nico/serve-spa/branch/master) General: [![Dependency Status](https://david-dm.org/analog-nico/serve-spa.svg)](https://david-dm.org/analog-nico/serve-spa)

## Why?

### Initial Page Load Performance

This is how a regular SPA (using Angular.js in this case) gets loaded:

![Timeline regular SPA](misc/timeline_regular.png)

The time until the user sees the page is significantly increased by the two AJAX requests "list.html" which is a HTML template and "projects" which is the JSON data used to populate the page.

With Serve-SPA you can easily inline the template / data into the index.html so that the AJAX calls are skipped and the page gets rendered immediately:

![Timeline precomposed SPA](misc/timeline_precomposed.png)

### SEO-Friendliness

SPAs served with this library are crawlable by Google. I explained this aspect in more detail in a [blog post](http://www.analog-ni.co/precomposing-a-spa-may-become-the-holy-grail-to-seo).

## Getting Started

### Roughly speaking...

If you already serve your SPA with the [express.static middleware](http://expressjs.com/guide/using-middleware.html#express.static) you will be able to serve it with Serve-SPA instead:

``` js
// Just replace:
app.use(express.static(appDir));

// with:
serveSpa(app, appDir);
```

Then you rename your `index.html` files to `index.htmlt` which gives you templating functionality to inline HTML templates and JSON data into the HTML served for each request. If you need to e.g. fetch the data from your database beforehand you can add a `compose.js` file alongside to do so.

BTW, Serve-SPA does not make any assumptions about how your SPA is implemented client-side. Any implementation should be able to work with the changes that need to be made server-side.

### Migrating a Simple SPA

Screencast forthcoming. It will explain how and why I turned a [regular Angular.js-based SPA](https://github.com/analog-nico/serve-spa-demos/tree/master/demos/angularjs/original) into a [precomposed SPA served with Serve-SPA](https://github.com/analog-nico/serve-spa-demos/tree/master/demos/angularjs/precomposed). Make a diff and you will see the required changes.

## Installation

[![NPM Stats](https://nodei.co/npm/serve-spa.png?downloads=true)](https://npmjs.org/package/serve-spa)

The module for node.js is installed via npm:

``` bash
npm install serve-spa --save
```

Serve-SPA depends on a loosely defined version of serve-static. If you want to install a specific version please install serve-static beforehand.

## Usage

### Initialization

Description forthcoming.

### The HTML Template(s) "index.htmlt"

Description forthcoming.

#### Error Handling

Description forthcoming.

### The Composing Script(s) "compose.js"

Description forthcoming.

#### Error Handling

Description forthcoming.

### Serving Static Files and pushState Support

Description forthcoming.

## Contributing

To set up your development environment for Serve-SPA:

1. Clone this repo to your desktop,
2. in the shell `cd` to the main folder,
3. hit `npm install`,
4. hit `npm install gulp -g` if you haven't installed gulp globally yet, and
5. run `gulp dev`. (Or run `node ./node_modules/.bin/gulp dev` if you don't want to install gulp globally.)

`gulp dev` watches all source files and if you save some changes it will lint the code and execute all tests. The test coverage report can be viewed from `./coverage/lcov-report/index.html`.

If you want to debug a test you should use `gulp test-without-coverage` to run all tests without obscuring the code by the test coverage instrumentation.

## Change History

- v0.3.0 (2015-09-18)
    - Added beforeAll hook
    - Updated dependencies
- v0.2.3 (2015-05-20)
    - Fixed matching templates to pushState URLs
    - Updated dependencies
- v0.2.2 (2015-04-12)
    - index.htmlt files are validated during startup
    - Updated dependencies
- v0.2.1 (2015-02-10)
    - Fix for using `express.Router()` in compose.js
    - Increased serve-static dependency to ^1.7.2 to fix a [vulnerability](https://nodesecurity.io/advisories/serve-static-open-redirect)
    - Added Node.js 0.12 and io.js to the Linux build
- v0.2.0 (2015-01-09)
    - **Breaking Change:** Renamed preproc.js to compose.js
- v0.1.1 (2014-12-22)
    - Allowing preproc.js to export an `express.Router()`
- v0.1.0 (2014-12-06)
    - Initial version

## License (ISC)

In case you never heard about the [ISC license](http://en.wikipedia.org/wiki/ISC_license) it is functionally equivalent to the MIT license.

See the [LICENSE file](LICENSE) for details.
