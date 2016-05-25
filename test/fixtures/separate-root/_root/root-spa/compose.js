'use strict';

var path = require('path');

var localpath = __dirname.substr(__dirname.indexOf('separate-root'));

module.exports = function (req, res, next) {
    req.localpath = localpath;
    next();
};
