'use strict';

module.exports = function (req, res, next) {
    res.test = "composed";
    next();
};
