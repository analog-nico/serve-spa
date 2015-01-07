'use strict';

module.exports = function (req, res, next) {
    setTimeout(function () {
        res.test = "composed";
        next();
    }, 10);
};
