'use strict';

function middleware(req, res, next) {
    res.set('set-by-compose', '+1');
    next();
}

middleware.callForHEAD = true;

module.exports = middleware;
