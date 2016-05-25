'use strict';

var path = require('path');

var localpath = __dirname.substr(__dirname.indexOf('separate-root-no-index-fallback-htmlt'));

module.exports = function (req, res, next) {
    req.localpath = localpath;
    next();
};
