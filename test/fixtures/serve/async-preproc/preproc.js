'use strict';

module.exports = function (req, res, next) {
    setTimeout(function () {
        res.test = "preproc'd";
        next();
    }, 10);
};
