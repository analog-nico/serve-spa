'use strict';

module.exports = function (req, res, next) {
    next(new Error('test'));
};
