'use strict';

var _ = require('lodash');
var path = require('path');
var serveStatic = require('serve-static');
var parseurl = require('parseurl');
var glob = require('glob');
var fs = require('fs');
var http = require('http');
var onHeaders = require('on-headers');


var pathIsAbsolute = function (path) {

    // Unix, Linux
    if (path.length >= 1 && path[0] === '/') {
        return true;
    }

    // Windows
    if (path.length >= 3 && path[1] === ':' && path[2] === '\\') {
        return true;
    }

    // Microsoft Azure
    if (path.length >= 2 && path[0] === '\\' && path[1] === '\\') {
        return true;
    }

    return false;

};

if (path.isAbsolute) {
    pathIsAbsolute = path.isAbsolute; // Supported from node v0.12 upwards
}

function pathToUri(p) {
    if (p === '' || p === '.') {
        return '/';
    } else {
        return '/' + p.split(path.sep).join('/') + '/';
    }
}

function findCacheEntry(cache, uri) {

    do {

        if (!_.isUndefined(cache[uri])) {
            return uri;
        } else if (uri === '/' || uri === '') {
            return;
        }

        var spUri = uri.split('/');
        if (spUri[spUri.length-1] === '') {
            spUri.pop();
        }
        spUri.pop();
        uri = spUri.join('/');
        uri += '/';

    } while (true);

}


module.exports = function initServeSpa(appOrRouter, rootPath, options) {

    // Validate arguments

    if (_.isUndefined(appOrRouter)) {
        throw new TypeError('Please pass the Express app or a router.');
    }

    if (_.isUndefined(rootPath)) {
        throw new TypeError('Please pass a root path.');
    } else if (!_.isString(rootPath)) {
        throw new TypeError('The root path must be of type string.');
    } else if (!pathIsAbsolute(rootPath)) {
        throw new TypeError('The root path must be absolute.');
    }

    if (_.isUndefined(options)) {
        options = {};
    } else if (!_.isPlainObject(options)) {
        throw new TypeError('The options argument must be of type object.');
    }

    if (!_.isUndefined(options.require) && !_.isFunction(options.require)) {
        throw new TypeError('The require option must be if type function.');
    }

    if (!_.isUndefined(options.beforeAll) && !_.isFunction(options.beforeAll)) {
        throw new TypeError('The beforeAll option must be if type function.');
    }


    // Cache HTML templates

    var cache = {};

    var templates = glob.sync('**/index.htmlt', { cwd: rootPath });
    _.forEach(templates, function (template) {

        var dir = path.dirname(template);

        try {
            cache[pathToUri(dir)] = {
                template: _.template(fs.readFileSync(path.join(rootPath, template)).toString(), options.templateSettings)
            };
        } catch (e) {
            throw new Error('Failed to parse the template "' + path.join(rootPath, template) + '" with error: ' + e.message);
        }

        var composefile = path.join(rootPath, path.join(dir, 'compose.js'));
        if (fs.existsSync(composefile)) {

            cache[pathToUri(dir)].compose = require(composefile);

            if (!_.isFunction(cache[pathToUri(dir)].compose)) {
                throw new TypeError('The following composing module does not export a function: ' + composefile);
            }

        }

    });


    // List the static files for differentiating them from pushState URIs

    var staticFiles = {};

    var files = glob.sync('**/*', { cwd: rootPath });
    _.forEach(files, function (file) {

        var basename = path.basename(file);
        if (basename.match(/^(index.htmlt|compose.js)$/i) !== null) {
            return; // --> Don't serve index.htmlt and compose.js directly
        }

        var uri = pathToUri(path.dirname(file)) + basename;
        staticFiles[uri] = true;

    });


    // Create and apply the middlewares

    function serveSpaPrepare(req, res, next) {

        // Configuration for downstream middlewares
        req._serveSpa = {
            before: false,
            compose: false,
            render: false
        };

        // Allow GET and HEAD only
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return next(); // serve-static will handle the other verbs appropriately
        }

        parseurl(req);

        // Serve static files as usual
        if (!_.isUndefined(staticFiles[req._parsedUrl.pathname])) {
            return next();
        }

        var cacheEntry = findCacheEntry(cache, req._parsedUrl.pathname);
        if (_.isUndefined(cacheEntry)) {
            return next(); // serve-static will send a 404.
        }

        // Configuration for before middleware
        if (!_.isUndefined(options.beforeAll)) {
            req._serveSpa.before = options.beforeAll;
        }

        // Configuration for compose middleware
        if (!_.isUndefined(cache[cacheEntry].compose)) {
            req._serveSpa.compose = cache[cacheEntry].compose;
        }

        // Configuration for render middleware
        req._serveSpa.render = cache[cacheEntry].template;

        next();

    }

    function serveSpaBefore(req, res, next) {

        if (req._serveSpa.before === false) {
            return next();
        }

        if (req.method === 'HEAD' && req._serveSpa.before.callForHEAD !== true) {
            return next();
        }

        return req._serveSpa.before(req, res, next);

    }

    function serveSpaCompose(req, res, next) {

        if (req._serveSpa.compose === false) {
            return next();
        }

        if (req.method === 'HEAD' && req._serveSpa.compose.callForHEAD !== true) {
            return next();
        }

        return req._serveSpa.compose(req, res, next);

    }

    function serveSpaRender(req, res, next) {

        if (req._serveSpa.render === false) {
            return next();
        }

        var data = {
            require: options.require || require,
            request: req,
            req: req,
            response: res,
            res: res
        };

        try {

            // Remove ETag header
            // See: https://github.com/strongloop/express/issues/2472
            onHeaders(res, function () {
                this.removeHeader('ETag');
            });

            res.set({
                'Surrogate-Control': 'no-store',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });

            if (req.method === 'HEAD') {
                res.send('');
                return;
            }

            var html = req._serveSpa.render(data);
            res.send(html);

        } catch(err) {
            next(err);
        }

    }

    appOrRouter.use(serveSpaPrepare);
    appOrRouter.use(serveSpaBefore);
    appOrRouter.use(serveSpaCompose);
    appOrRouter.use(serveSpaRender);

    appOrRouter.use(serveStatic(rootPath, options.staticSettings));


    // For debugging...
    return {
        cache: cache,
        staticFiles: staticFiles
    };

};
