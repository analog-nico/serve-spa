'use strict';

module.exports = function (req, res, next) {
    res.set('set-by-compose', '+1');
    next();
};
