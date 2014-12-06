'use strict';

var express = require('express');
var http = require('http');
var serveSpa = require('../../lib/index.js');
var path = require('path');
var rp = require('request-promise');


describe('If there are no templates, Serve-SPA', function () {

    var server;

    before(function (done) {
        var app = express();
        serveSpa(app, path.join(__dirname, '../fixtures/invalid/no-templates/'));
        server = http.createServer(app);
        server.listen(4000, function () { done(); });
    });

    after(function () {
        server.close();
    });


    it('should still serve static files in the root directory', function () {

        return rp('http://localhost:4000/test.json')
            .then(function (body) {
                expect(body).to.equal('{ "loc": "root" }');
            });

    });

    it('should still serve static files in subdirectories', function () {

        return rp('http://localhost:4000/sub1/test.json')
            .then(function (body) {
                expect(body).to.equal('{ "loc": "sub1" }');
            });

    });

    it('should send a 404 for the root directory', function () {

        return rp({ uri: 'http://localhost:4000/', simple: false, resolveWithFullResponse: true })
            .then(function (response) {
                expect(response.statusCode).to.equal(404);
            });

    });

    it('should send a 404 for an existing subdirectory', function () {

        return rp({ uri: 'http://localhost:4000/sub1/', simple: false, resolveWithFullResponse: true })
            .then(function (response) {
                expect(response.statusCode).to.equal(404);
            });

    });

    it('should send a 404 for an existing subdirectory with redirect', function () {

        return rp({ uri: 'http://localhost:4000/sub1', simple: false, resolveWithFullResponse: true })
            .then(function (response) {
                expect(response.statusCode).to.equal(404);
            });

    });

    it('should send a 404 for a not existing subdirectory (aka pushState)', function () {

        return rp({ uri: 'http://localhost:4000/notexisting/', simple: false, resolveWithFullResponse: true })
            .then(function (response) {
                expect(response.statusCode).to.equal(404);
            });

    });

    it('should send a 404 for a not existing file (aka pushState)', function () {

        return rp({ uri: 'http://localhost:4000/sub1/notexisting.txt', simple: false, resolveWithFullResponse: true })
            .then(function (response) {
                expect(response.statusCode).to.equal(404);
            });

    });

});
