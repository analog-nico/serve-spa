'use strict';

var express = require('express');
var http = require('http');
var serveSpa = require('../../lib/index.js');
var path = require('path');
var rp = require('request-promise');


describe('If rootPath is an Array, Serve-SPA', function () {

    var server;

    it('should validate the parameters', function() {

        var app = express();

        expect(function () {
            serveSpa(app, []);
        }).to.throw();

        expect(function () {
            serveSpa(app, [42]);
        }).to.throw();

        expect(function () {
            serveSpa(app, ['']);
        }).to.throw();

        expect(function () {
            serveSpa(app, ['relative/path']);
        }).to.throw();

        expect(function () {
            serveSpa(app, [path.join(__dirname, 'relative/path')]);
        }).not.to.throw();

        expect(function () {
            serveSpa(app, [path.join(__dirname, 'relative/path'), 42]);
        }).to.throw();

        expect(function () {
            serveSpa(app, [path.join(__dirname, 'relative/path'), '']);
        }).to.throw();

        expect(function () {
            serveSpa(app, [path.join(__dirname, 'relative/path'), 'relative/path']);
        }).to.throw();

        expect(function () {
            serveSpa(app, [path.join(__dirname, 'relative/path'), path.join(__dirname, 'relative/path')]);
        }).not.to.throw();

    });

    describe('with a full setup', function () {

        before(function (done) {
            var app = express();
            serveSpa(app, [
                path.join(__dirname, '../fixtures/separate-root/_root/'),
                path.join(__dirname, '../fixtures/separate-root/')
            ]);
            server = http.createServer(app);
            server.listen(4000, function () { done(); });
        });

        after(function () {
            server.close();
        });


        it('should serve the root of the spa in the first path', function () {

            return rp('http://localhost:4000/')
                .then(function (body) {
                    expect(body).to.equal('index.htmlt - separate-root/_root');
                });

        });

        it('should serve a pushState url of the spa in the first path', function () {

            return rp('http://localhost:4000/some/state')
                .then(function (body) {
                    expect(body).to.equal('index.htmlt - separate-root/_root');
                });

        });

        it('should serve the root of the spa in the second path', function () {

            return rp('http://localhost:4000/spa')
                .then(function (body) {
                    expect(body).to.equal('index.htmlt - separate-root/spa');
                });

        });

        it('should serve a pushState url of the spa in the second path', function () {

            return rp('http://localhost:4000/spa/some/state')
                .then(function (body) {
                    expect(body).to.equal('index.htmlt - separate-root/spa');
                });

        });

        it('should serve a static file in the first path', function () {

            return rp('http://localhost:4000/static.txt')
                .then(function (body) {
                    expect(body).to.equal('static.txt - separate-root/_root');
                });

        });

        it('should serve a static file below the first path', function () {

            return rp('http://localhost:4000/folder/static.txt')
                .then(function (body) {
                    expect(body).to.equal('static.txt - separate-root/_root/folder');
                });

        });

        it('should serve a static file further below the first path', function () {

            return rp('http://localhost:4000/root-spa/folder/static.txt')
                .then(function (body) {
                    expect(body).to.equal('static.txt - separate-root/_root/root-spa/folder');
                });

        });

        it('should serve a static file below the second path', function () {

            return rp('http://localhost:4000/spa/static.txt')
                .then(function (body) {
                    expect(body).to.equal('static.txt - separate-root/spa');
                });

        });

        it('should serve a static file further below the second path', function () {

            return rp('http://localhost:4000/spa/folder/static.txt')
                .then(function (body) {
                    expect(body).to.equal('static.txt - separate-root/spa/folder');
                });

        });

        it('should serve a static file in the first path that also exists in the second path', function () {

            return rp('http://localhost:4000/existsAtSeparateRootAndRealRoot.txt')
                .then(function (body) {
                    expect(body).to.equal('existsAtSeparateRootAndRealRoot.txt - separate-root/_root');
                });

        });

        it('should serve a static file below the first path that also exists in the second path', function () {

            return rp('http://localhost:4000/spa/existsAtSeparateRootAndSpa.txt')
                .then(function (body) {
                    expect(body).to.equal('existsAtSeparateRootAndSpa.txt - separate-root/_root');
                });

        });

        it('should serve an index.html in the first path that also exists in the second path', function () {

            return rp('http://localhost:4000/folder/' /* since automatic index.html lookup not supported below a index.htmlt */ + 'index.html')
                .then(function (body) {
                    expect(body).to.equal('index.html - separate-root/_root/folder');
                });

        });

        it('should serve a static file within the first path that is inside the scond path (overlapping paths)', function () {

            return rp('http://localhost:4000/_root/folder/static.txt')
                .then(function (body) {
                    expect(body).to.equal('static.txt - separate-root/_root/folder');
                });

        });

    });

    describe('with a setup missing a index.html(t)', function () {

        before(function (done) {
            var app = express();
            serveSpa(app, [
                path.join(__dirname, '../fixtures/separate-root-no-index/_root/'),
                path.join(__dirname, '../fixtures/separate-root-no-index/')
            ]);
            server = http.createServer(app);
            server.listen(4000, function () {
                done();
            });
        });

        after(function () {
            server.close();
        });


        it('should serve a static file', function () {

            return rp('http://localhost:4000/static.txt')
                .then(function (body) {
                    expect(body).to.equal('static.txt - separate-root-no-index/_root');
                });

        });

        it('should send a 404 for the root', function () {

            return rp('http://localhost:4000/')
                .then(function (body) {
                    throw new Error('No 404 received');
                })
                .catch(function (err) {
                    expect(err.statusCode).to.eql(404);
                });

        });

        it('should send a 404 for the index.html', function () {

            return rp('http://localhost:4000/index.html')
                .then(function (body) {
                    throw new Error('No 404 received');
                })
                .catch(function (err) {
                    expect(err.statusCode).to.eql(404);
                });

        });

    });

    describe('with a setup missing a index.html(t) but with a index.html in the second folder', function () {

        before(function (done) {
            var app = express();
            serveSpa(app, [
                path.join(__dirname, '../fixtures/separate-root-no-index-fallback-html/_root/'),
                path.join(__dirname, '../fixtures/separate-root-no-index-fallback-html/')
            ]);
            server = http.createServer(app);
            server.listen(4000, function () {
                done();
            });
        });

        after(function () {
            server.close();
        });


        it('should serve a static file', function () {

            return rp('http://localhost:4000/static.txt')
                .then(function (body) {
                    expect(body).to.equal('static.txt - separate-root-no-index-fallback-html/_root');
                });

        });

        it('should send a 404 for the root', function () {

            return rp('http://localhost:4000/')
                .then(function (body) {
                    expect(body).to.eql('index.html - separate-root-no-index-fallback-html');
                });

        });

    });

    describe('with a setup missing a index.html(t) but with a index.htmlt in the second folder', function () {

        before(function (done) {
            var app = express();
            serveSpa(app, [
                path.join(__dirname, '../fixtures/separate-root-no-index-fallback-htmlt/_root/'),
                path.join(__dirname, '../fixtures/separate-root-no-index-fallback-htmlt/')
            ]);
            server = http.createServer(app);
            server.listen(4000, function () {
                done();
            });
        });

        after(function () {
            server.close();
        });


        it('should serve a static file', function () {

            return rp('http://localhost:4000/static.txt')
                .then(function (body) {
                    expect(body).to.equal('static.txt - separate-root-no-index-fallback-htmlt/_root');
                });

        });

        it('should send a 404 for the root', function () {

            return rp('http://localhost:4000/')
                .then(function (body) {
                    expect(body).to.eql('index.htmlt - separate-root-no-index-fallback-htmlt');
                });

        });

    });

    describe('with a setup with a static page in the second path and a spa in the second path', function () {

        before(function (done) {
            var app = express();
            serveSpa(app, [
                path.join(__dirname, '../fixtures/separate-root-static/_root/'),
                path.join(__dirname, '../fixtures/separate-root-static/')
            ]);
            server = http.createServer(app);
            server.listen(4000, function () {
                done();
            });
        });

        after(function () {
            server.close();
        });


        it('should serve the static page in the first path', function () {

            return rp('http://localhost:4000/')
                .then(function (body) {
                    expect(body).to.equal('index.html - separate-root-static/_root');
                });

        });

        it('should send a 404 for the root', function () {

            return rp('http://localhost:4000/spa')
                .then(function (body) {
                    expect(body).to.eql('index.htmlt - separate-root-static/spa');
                });

        });

    });

});
