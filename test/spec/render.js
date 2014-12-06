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


    it('should render without preprocessing', function () {

        return rp('http://localhost:4000/without-preproc')
            .then(function (body) {
                expect(body).to.equal('without - /without-preproc/');
            });

    });

    it('should render without preprocessing', function () {

        return rp('http://localhost:4000/with-preproc')
            .then(function (body) {
                expect(body).to.equal("with - /with-preproc/ - preproc'd");
            });

    });

});
