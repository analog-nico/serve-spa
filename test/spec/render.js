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
        serveSpa(app, path.join(__dirname, '../fixtures/serve/'));
        server = http.createServer(app);
        server.listen(4000, function () { done(); });
    });

    after(function () {
        server.close();
    });


    it('should render without composing', function () {

        return rp('http://localhost:4000/without-compose')
            .then(function (body) {
                expect(body).to.equal('without - /without-compose/');
            });

    });

    it('should render with composing', function () {

        return rp('http://localhost:4000/with-compose')
            .then(function (body) {
                expect(body).to.equal("with - /with-compose/ - composed");
            });

    });

    it('should render with async composing', function () {

        return rp('http://localhost:4000/async-compose')
            .then(function (body) {
                expect(body).to.equal("async - /async-compose/ - composed");
            });

    });

    it('should allow a router to be used for composing', function () {

        return rp('http://localhost:4000/compose-with-router/edit/0123456789')
            .then(function (body) {
                expect(body).to.equal("with - /compose-with-router/edit/0123456789 - 0123456789");
            });

    });

    it('should provide req, res, and require for rendering', function () {

        return rp('http://localhost:4000/')
            .then(function (body) {
                expect(body).to.equal("advanced - / - / - false - false - /foo/bar/baz");
            });

    });

    it('should set the http headers appropriately', function () {

        return rp({ uri: 'http://localhost:4000/', resolveWithFullResponse: true })
            .then(function (response) {
                expect(response.headers['content-type']).to.eql('text/html; charset=utf-8');
                // No caching
                expect(response.headers['etag']).to.eql(undefined);
                expect(response.headers['cache-control']).to.eql('no-cache, no-store, must-revalidate');
                expect(response.headers['pragma']).to.eql('no-cache');
                expect(response.headers['expires']).to.eql('0');
            });

    });

    it('should render undisturbed by a querystring', function () {

        return rp('http://localhost:4000/without-compose?query=string')
            .then(function (body) {
                expect(body).to.equal('without - /without-compose/?query=string');
            });

    });

    it('should render undisturbed by a hash', function () {

        return rp('http://localhost:4000/without-compose#some-hash')
            .then(function (body) {
                expect(body).to.equal('without - /without-compose/');
            });

    });

});
