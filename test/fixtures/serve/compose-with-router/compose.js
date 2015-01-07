'use strict';

var express = require('express');


var router = express.Router();

// FIXME: The router should register relative paths. In this case just /edit/:_id
router.get('/compose-with-router/edit/:_id', function (req, res, next) {
    req.test = req.params._id;
    next();
});

router.get('/compose-with-router/', function (req, res, next) {
    req.test = 'base';
    next();
});

module.exports = router;
