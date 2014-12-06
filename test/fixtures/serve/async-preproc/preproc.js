'use strict';

module.exports = function (req, res, render) {
    setTimeout(function () {
        render({ test: "preproc'd" });
    }, 10);
};
