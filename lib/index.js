'use strict';

var _ = require('lodash');
var path = require('path');
var serveStatic = require('serve-static');
var parseurl = require('parseurl');
var glob = require('glob');
var fs = require('fs');
var http = require('http');


function pathIsAbsolute(path) {
    if (path.length >= 1 && path[0] === '/') {
        return true;
    }
    if (path.length >= 3 && path[1] === ':' && path[2] === '\\') {
        return true;
    }
    return false;
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
        spUri.pop();
        spUri.pop();
        uri = spUri.join('/');
        uri += '/';

    } while (true);

}


module.exports = function initServeSpa(app, root, options) {

    // Validate arguments

    if (_.isUndefined(app)) {
        throw new TypeError('Please pass the Express app.');
    }

    if (_.isUndefined(root)) {
        throw new TypeError('Please pass a root path.');
    } else if (!_.isString(root)) {
        throw new TypeError('The root path must be of type string.');
    } else if (!pathIsAbsolute(root)) {
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


    // Cache HTML templates

    var cache = {};

    var templates = glob.sync('**/index.htmlt', { cwd: root });
    _.forEach(templates, function (template) {

        var dir = path.dirname(template);

        cache[pathToUri(dir)] = {
            template: fs.readFileSync(path.join(root, template)).toString()
        };

        var preproc = path.join(root, path.join(dir, 'preproc.js'));
        if (fs.existsSync(preproc)) {

            cache[pathToUri(dir)].preproc = require(preproc);

            if (!_.isFunction(cache[pathToUri(dir)].preproc)) {
                throw new TypeError('The following preprocessing module does not export a function: ' + preproc);
            }

        }

    });


    // List the static files for differentiating them from pushState URIs

    var staticFiles = {};

    var files = glob.sync('**/*', { cwd: root });
    _.forEach(files, function (file) {
        var uri = pathToUri(path.dirname(file)) + path.basename(file);
        staticFiles[uri] = true;
    });


    // Create and apply the middleware

    function serveSpa(req, res, next) {

        function render() {

            if (arguments.length > 0) {
                // Error provided or route forward intended...
                return next.apply(undefined, arguments);
            }

            var data = {
                require: options.require || require,
                request: req,
                req: req,
                response: res,
                res: res
            };

            try {

                var html = _.template(cache[cacheEntry].template, data, options.templateSettings);

                res.set({
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                });
                res.send(html);

            } catch(err) {
                next(err);
            }

        }

        var url = parseurl(req);

        // Don't serve index.htmlt and preproc.js directly
        if (url.pathname.match(/\/(index.htmlt|preproc.js)$/i) !== null) {
            // Ignore files with same behavior as SendStream.prototype.error(404) in npm package 'send'
            res._headers = undefined;
            res.statusCode = 404;
            res.end(http.STATUS_CODES[404]);
            return;
        }

        // Serve static files as usual
        if (!_.isUndefined(staticFiles[url.pathname])) {
            return next();
        }

        var cacheEntry = findCacheEntry(cache, url.pathname);
        if (_.isUndefined(cacheEntry)) {
            return next();
        }

        // Render template
        if (!_.isUndefined(cache[cacheEntry].preproc)) {
            cache[cacheEntry].preproc(req, res, render);
        } else {
            render();
        }

    }

    app.use(serveSpa);
    app.use(serveStatic(root, options.staticSettings));


    // For debugging...
    return {
        cache: cache,
        staticFiles: staticFiles
    };

};
