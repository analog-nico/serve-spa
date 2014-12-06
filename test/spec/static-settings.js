'use strict';

var express = require('express');
var http = require('http');
var serveSpa = require('../../lib/index.js');
var path = require('path');
var rp = require('request-promise');


describe('Regarding serving static files, Serve-SPA', function () {

    var server;

    before(function (done) {
        var app = express();
        serveSpa(app, path.join(__dirname, '../fixtures/serve/'), {
            staticSettings: {
                redirect: false
            }
        });
        server = http.createServer(app);
        server.listen(4000, function () { done(); });
    });

    after(function () {
        server.close();
    });


    it('should not forward with slash for directory with feature disabled', function () {

        return rp({ uri: 'http://localhost:4000/sub1', simple: false, resolveWithFullResponse: true })
            .then(function (response) {
                expect(response.statusCode).to.equal(404);
            });

    });

});
