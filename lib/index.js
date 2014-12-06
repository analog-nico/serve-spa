'use strict';

var _ = require('lodash');
var path = require('path');
var serveStatic = require('serve-static');
var parseurl = require('parseurl');
var glob = require('glob');
var fs = require('fs');
var http = require('http');


module.exports = function initServeSpa(app, root, options) {

    // Validate arguments

    if (_.isUndefined(app)) {
        throw new TypeError('Please pass the Express app.');
    }

    if (_.isUndefined(root)) {
        throw new TypeError('Please pass a root path.');
    } else if (!_.isString(root)) {
        throw new TypeError('The root path must be of type string.');
    } else if (path.normalize(root) === path.resolve(root)) {
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

        cache[dir] = {
            template: fs.readFileSync(path.join(root, template))
        };

        var preproc = path.join(root, path.join(dir, 'preproc.js'));
        if (fs.existsSync(preproc)) {
            cache[dir].preproc = require(preproc);
        }

    });

    // Create and apply the middleware

    function serveSpa(req, res, next) {

        function render(data) {

            if (!_.isPlainObject(data)) {
                data = {};
            }

            _.assign(data, {
                require: options.require || require,
                request: req,
                req: req,
                response: res,
                res: res
            });

            var html = _.template(cache[url.pathname].template, data, options.lodashTemplateSettings);

            res.send(html);

        }

        var url = parseurl(req);

        if (url.pathname.match(/\/[index.htmlt|preproc.js]$/i) !== null) {
            // Ignore files with same behavior as SendStream.prototype.error(404) in npm package 'send'
            res._headers = undefined;
            res.statusCode = 404;
            res.end(http.STATUS_CODES[404]);
            return;
        }

        if (url.pathname[url.pathname.length-1] !== '/' || _.isUndefined(cache[url.pathname])) {
            return next();
        }

        if (!_.isUndefined(cache[url.pathname].preproc)) {
            cache[url.pathname].preproc(req, res, render);
        } else {
            render();
        }

    }

    app.use(serveSpa);
    app.use(serveStatic(root, options.serveStatic));

};
