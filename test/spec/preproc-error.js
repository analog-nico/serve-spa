'use strict';

var express = require('express');
var http = require('http');
var serveSpa = require('../../lib/index.js');
var path = require('path');
var rp = require('request-promise');


describe('Regarding rendering the template, Serve-SPA', function () {

    var server;

    before(function (done) {

        var app = express();
        serveSpa(app, path.join(__dirname, '../fixtures/invalid/preproc-error'));

        app.use(function(err, req, res, next) {
            res.statusCode = 500;
            res.end(http.STATUS_CODES[500]);
        });

        server = http.createServer(app);
        server.listen(4000, function () { done(); });

    });

    after(function () {
        server.close();
    });


    it('should handle a preprocessing error', function () {

        return rp({ uri: 'http://localhost:4000/', simple: false, resolveWithFullResponse: true })
            .then(function (response) {
                expect(response.statusCode).to.equal(500);
            });

    });

});
