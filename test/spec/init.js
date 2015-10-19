'use strict';

var initServeSpa = require('../../lib/index.js');
var app = require('express')();
var path = require('path');
var _ = require('lodash');


describe('Regarding its initialization, Serve-SPA', function () {

    it('should reject invalid arguments', function () {

        expect(function () {
            initServeSpa();
        }).to.throw('Please pass the Express app.');

        expect(function () {
            initServeSpa(app);
        }).to.throw('Please pass a root path.');

        expect(function () {
            initServeSpa(app, false);
        }).to.throw('The root path must be of type string.');

        expect(function () {
            initServeSpa(app, '../relative.path');
        }).to.throw('The root path must be absolute.');

        expect(function () {
            initServeSpa(app, '/absolute.path', false);
        }).to.throw('The options argument must be of type object.');

        expect(function () {
            initServeSpa(app, '/absolute.path', { require: false });
        }).to.throw('The require option must be if type function.');

        expect(function () {
            initServeSpa(app, '/absolute.path', { beforeAll: false });
        }).to.throw('The beforeAll option must be if type function.');

        expect(function () {
            initServeSpa(app, path.join(__dirname, '../fixtures/invalid/compose-export/'));
        }).to.throw('The following composing module does not export a function: ' + path.join(__dirname, '../fixtures/invalid/compose-export/compose.js'));

    });

    it('should fill the cache', function () {

        var serveSpa = initServeSpa(app, path.join(__dirname, '../fixtures/init/'));

        expect(serveSpa.cache['/'].template()).to.eql('root');
        expect(serveSpa.cache['/'].compose.loc).to.eql('root');
        expect(serveSpa.cache['/sub1/'].template()).to.eql('sub1');
        expect(serveSpa.cache['/sub1/'].compose.loc).to.eql('sub1');
        expect(serveSpa.cache['/sub1/subsub1/'].template()).to.eql('subsub1');
        expect(serveSpa.cache['/sub1/subsub1/'].compose.loc).to.eql('subsub1');
        expect(serveSpa.cache['/sub2/'].template()).to.eql('sub2');
        expect(serveSpa.cache['/sub2/'].compose).to.eql(undefined);
        expect(serveSpa.cache['/sub3/']).to.eql(undefined);
        expect(serveSpa.cache['/sub4/']).to.eql(undefined);

    });

    it('should discover the static files', function () {

        var serveSpa = initServeSpa(app, path.join(__dirname, '../fixtures/serve/'));

        expect(_.keys(serveSpa.staticFiles)).to.eql([
            '/async-compose',
            '/beforeAll-hook',
            '/compose-with-router',
            '/sub1',
            '/sub1/test.json',
            '/test',
            '/test.json',
            '/tmpl-settings',
            '/with-compose',
            '/without-compose'
        ]);

    });

    it('should abort when invalid template found', function () {

        expect(function () {
            initServeSpa(app, path.join(__dirname, '../fixtures/serve/'), {
                templateSettings: {
                    interpolate: /{{([\s\S]+?)}}/g // This makes _.template(...) fail
                }
            });
        }).to.throw();

    });

});
