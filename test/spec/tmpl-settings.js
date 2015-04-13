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
        serveSpa(app, path.join(__dirname, '../fixtures/serve/tmpl-settings/'), {
            templateSettings: {
                interpolate: /{{([\s\S]+?)}}/g
            }
        });
        server = http.createServer(app);
        server.listen(4000, function () { done(); });
    });

    after(function () {
        server.close();
    });


    it('should render with different template settings', function () {

        return rp('http://localhost:4000/')
            .then(function (body) {
                expect(body).to.equal('tmpl - /');
            });

    });

});
