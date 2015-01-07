# Serve-SPA

[Express](http://expressjs.com) middleware to serve single page applications in a performant and SEO friendly way

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/analog-nico/serve-spa?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Linux: [![Linux Build Status](https://travis-ci.org/analog-nico/serve-spa.svg?branch=master)](https://travis-ci.org/analog-nico/serve-spa) [![Coverage Status](https://coveralls.io/repos/analog-nico/serve-spa/badge.png)](https://coveralls.io/r/analog-nico/serve-spa?branch=master) Windows: [![Windows Build Status](https://ci.appveyor.com/api/projects/status/b6ps2l9im3rr6eqh/branch/master?svg=true)](https://ci.appveyor.com/project/analog-nico/serve-spa/branch/master) General: [![Dependency Status](https://david-dm.org/analog-nico/serve-spa.svg)](https://david-dm.org/analog-nico/serve-spa)

## Why?

Single page applications like those built based on [Backbone](http://backbonejs.org), [Ember](http://emberjs.com), or [Angular](https://angularjs.org) follow an architectural pattern that is great in many ways but one: SEO friendliness. A common solution is to serve the SPA only to humans and pre-rendered pages to searchbots. However, there must be a better solution than maintaining a second code base or increasing the code complexity by making it isomorphic.

When Google [announced that their bots execute JavaScript](http://googlewebmastercentral.blogspot.com/2014/05/understanding-web-pages-better.html), SPAs should finally be searchable, right? Not quite: Usually pages are rendered after at least one initial AJAX request returns from the server containing the data with which the page is populated. That long, however, the Google bot is not waiting.

If you want to implement a SEO friendly SPA without any complicated handling of its search-ability you need to get it right. Serve-SPA allows you to do so.

## Getting Started

If you already serve your SPA with the [express.static middleware](http://expressjs.com/guide/using-middleware.html#express.static) and maybe a router / routes to support pushState you will be able to serve it with Serve-SPA instead. Then you need to make intuitive changes regarding how to bundle and load your resources and data. These changes not only make your SPA SEO friendly but also improve the performance for your human users. So you might want to do those changes anyway.

BTW, Serve-SPA does not make any assumptions about how your SPA is implemented client-side. Any implementation should be able to work with the changes that need to be made server-side.

### The Architecture

To be SEO friendly the SPA must not make any AJAX request before rendering a page client-side. For that:

 - All required resources (JavaScript, HTML templates) need to be directly linked or inlined into the main HTML file. This can be done either manually or through bundlers like [Browserify](http://browserify.org) or [Webpack](http://webpack.github.io) (recommended).
 - And data that would otherwise be requested through initial AJAX calls need to be inlined into the main HTML file for each initial page visit so that the AJAX calls can be skipped and the page rendered immediately.

### Migrating a Simple SPA

Screencast forthcoming.

## Installation

[![NPM Stats](https://nodei.co/npm/serve-spa.png?downloads=true)](https://npmjs.org/package/serve-spa)

The module for node.js is installed via npm:

``` bash
npm install serve-spa --save
```

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

1. Clone the repo to your desktop,
2. in the shell `cd` to the main folder,
3. hit `npm install`,
4. hit `npm install gulp -g` if you haven't installed gulp globally yet, and
5. run `gulp dev`. (Or run `node ./node_modules/.bin/gulp dev` if you don't want to install gulp globally.)

`gulp dev` watches all source files and if you save some changes it will lint the code and execute all tests. The test coverage report can be viewed from `./coverage/lcov-report/index.html`.

If you want to debug a test you should use `gulp test-without-coverage` to run all tests without obscuring the code by the test coverage instrumentation.

## Change History

- v0.2.0 (2015-01-06)
    - **Breaking Change:** Renamed preproc.js to compose.js
- v0.1.1 (2014-12-22)
    - Allowing preproc.js to export an `express.Router()`
- v0.1.0 (2014-12-06)
    - Initial version

## License (ISC)

In case you never heard about the [ISC license](http://en.wikipedia.org/wiki/ISC_license) it is functionally equivalent to the MIT license.

See the [LICENSE file](LICENSE) for details.