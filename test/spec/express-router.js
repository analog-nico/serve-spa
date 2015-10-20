'use strict';

var express = require('express');
var http = require('http');
var serveSpa = require('../../lib/index.js');
var path = require('path');
var rp = require('request-promise');


describe('Regarding Express routing, Serve-SPA', function () {

    var server;

    before(function (done) {
        var app = express();

        var router1 = express.Router();
        serveSpa(router1, path.join(__dirname, '../fixtures/serve/with-compose/'));
        app.use('/router-to-with-compose', router1);

        var router2 = express.Router();
        serveSpa(router2, path.join(__dirname, '../fixtures/serve/without-compose/'));
        app.use('/router-to-without-compose', router2);

        server = http.createServer(app);
        server.listen(4000, function () {
            done();
        });
    });

    after(function () {
        server.close();
    });

    it('should bind to a router (1)', function () {

        return rp('http://localhost:4000/router-to-with-compose/')
            .then(function (body) {
                expect(body).to.eql('with - / - composed');
            });

    });

    it('should bind to a router (2)', function () {

        return rp('http://localhost:4000/router-to-without-compose/')
            .then(function (body) {
                expect(body).to.eql('without - /');
            });

    });

});
