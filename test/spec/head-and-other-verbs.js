'use strict';

var express = require('express');
var http = require('http');
var serveSpa = require('../../lib/index.js');
var path = require('path');
var rp = require('request-promise');


describe('Regarding other HTTP verbs, Serve-SPA', function () {

    var server;

    before(function (done) {
        var app = express();
        serveSpa(app, path.join(__dirname, '../fixtures/serve/'), {

            beforeAll: function (req, res, next) {
                res.set('set-by-before', '+1');
                next();
            }

        });
        server = http.createServer(app);
        server.listen(4000, function () {
            done();
        });
    });

    after(function () {
        server.close();
    });

    describe('should allow HEAD', function () {

        it('for a static file (json)', function () {

            return rp.head('http://localhost:4000/sub1/test.json')
                .then(function (headers) {
                    expect(headers['content-type']).to.eql('application/json');
                });

        });

        it('for a static file (html)', function () {

            return rp.head('http://localhost:4000/regular.html')
                .then(function (headers) {
                    expect(headers['content-type']).to.eql('text/html; charset=UTF-8');
                });

        });

        it('for a template without HEAD support', function () {

            return rp.head({ uri: 'http://localhost:4000/head/not-supported/', resolveWithFullResponse: true })
                .then(function (response) {
                    expect(response.headers['content-type']).to.eql('text/html; charset=utf-8');
                    expect(response.headers['content-length']).to.eql('0');
                    // No caching
                    expect(response.headers['cache-control']).to.eql('no-cache, no-store, must-revalidate');
                    expect(response.headers['pragma']).to.eql('no-cache');
                    expect(response.headers['expires']).to.eql('0');

                    expect(response.headers['set-by-before']).to.eql(undefined);
                    expect(response.headers['set-by-compose']).to.eql(undefined);
                    expect(response.headers['set-by-template']).to.eql(undefined);

                    expect(response.body).to.eql('');
                });

        });

        it('for a template with HEAD support', function (done) {

            function before(req, res, next) {
                res.set('set-by-before', '+1');
                next();
            }
            before.callForHEAD = true;

            var app = express();
            serveSpa(app, path.join(__dirname, '../fixtures/serve/'), {

                beforeAll: before

            });
            var server = http.createServer(app);
            server.listen(4001, function () {

                rp.head({ uri: 'http://localhost:4001/head/supported/', resolveWithFullResponse: true })
                    .then(function (response) {
                        expect(response.headers['content-type']).to.eql('text/html; charset=utf-8');
                        expect(response.headers['content-length']).to.eql('0');
                        // No caching
                        expect(response.headers['cache-control']).to.eql('no-cache, no-store, must-revalidate');
                        expect(response.headers['pragma']).to.eql('no-cache');
                        expect(response.headers['expires']).to.eql('0');

                        expect(response.headers['set-by-before']).to.eql('+1');
                        expect(response.headers['set-by-compose']).to.eql('+1');
                        expect(response.headers['set-by-template']).to.eql(undefined);

                        expect(response.body).to.eql('');

                        server.close();
                        done();
                    });

            });

        });

    });

    describe('should not allow', function () {

        it('POST to a template', function () {

            return rp.post({ uri: 'http://localhost:4000/sub1/', simple:false, resolveWithFullResponse: true })
                .then(function (response) {
                    expect(response.statusCode).to.equal(404);
                });

        });

        it('POST to a static file', function () {

            return rp.post({ uri: 'http://localhost:4000/sub1/test.json', simple:false, resolveWithFullResponse: true })
                .then(function (response) {
                    expect(response.statusCode).to.equal(404);
                });

        });

    });

});
