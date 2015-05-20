'use strict';

var express = require('express');
var http = require('http');
var serveSpa = require('../../lib/index.js');
var path = require('path');
var rp = require('request-promise');


describe('Regarding pushState support, Serve-SPA', function () {

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


    it('should render for the parent folder if the subfolder does not exist', function () {

        return rp('http://localhost:4000/nonexisting/')
            .then(function (body) {
                expect(body).to.equal('advanced - /nonexisting/ - /nonexisting/ - false - false - /foo/bar/baz');
            });

    });

    it('should render for the deepest folder if the subfolder does not exist', function () {

        return rp('http://localhost:4000/sub1/nonexisting1/nonexisting2/nonexisting3')
            .then(function (body) {
                expect(body).to.equal('sub1');
            });

    });

    it('should render for the current folder is the subfile does not exist', function () {

        return rp('http://localhost:4000/nonexisting')
            .then(function (body) {
                expect(body).to.equal('advanced - /nonexisting - /nonexisting - false - false - /foo/bar/baz');
            });

    });

    it('should render for the current folder is the subfile does not exist 2', function () {

        return rp('http://localhost:4000/sub1/nonexisting')
            .then(function (body) {
                expect(body).to.equal('sub1');
            });

    });

    it('should still serve the files without file extension', function () {

        return rp('http://localhost:4000/test')
            .then(function (body) {
                expect(body).to.equal('{ "loc": "root" }');
            });

    });

});
