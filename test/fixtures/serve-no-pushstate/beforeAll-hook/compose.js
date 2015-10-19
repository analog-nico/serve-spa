'use strict';

module.exports = function (req, res, next) {
    req.param2 = 'overwritten';
    next();
};
