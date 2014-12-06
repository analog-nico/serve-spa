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
        serveSpa(app, path.join(__dirname, '../fixtures/serve/'));
        server = http.createServer(app);
        server.listen(4000, function () { done(); });
    });

    after(function () {
        server.close();
    });


    it('should serve files in the root directory', function () {

        return rp('http://localhost:4000/test.json')
            .then(function (body) {
                expect(body).to.equal('{ "loc": "root" }');
            });

    });

    it('should serve files in a subdirectory', function () {

        return rp('http://localhost:4000/sub1/test.json')
            .then(function (body) {
                expect(body).to.equal('{ "loc": "sub1" }');
            });

    });

    it('should return a 404 for index.html', function () {

        return rp({ uri: 'http://localhost:4000/index.htmlt', simple: false, resolveWithFullResponse: true })
            .then(function (response) {
                expect(response.statusCode).to.equal(404);
            });

    });

    it('should return a 404 for preproc.js', function () {

        return rp({ uri: 'http://localhost:4000/preproc.js', simple: false, resolveWithFullResponse: true })
            .then(function (response) {
                expect(response.statusCode).to.equal(404);
            });

    });

    it('should forward with slash for directory', function () {

        return rp('http://localhost:4000/sub1')
            .then(function (body) {
                expect(body).to.equal('sub1');
            });

    });

    it('should forward with slash for root directory', function () {

        return rp('http://localhost:4000')
            .then(function (body) {
                expect(body).to.equal('advanced - / - / - false - false - /foo/bar/baz');
            });

    });

});
