"use strict";

var express = require('express');
var readdir = require('recursive-readdir');
var _ = require('underscore');

module.exports = function (dir) {

    var saffyre = express.Router();

    readdir(dir, function (e, files) {

        files = _.sortBy(_.map(files, (file) => {
            var path = file.replace(dir + '/', '');
            return {
                segments: path.replace(/\.js$/, '').split('/'),
                path: path.replace(/\.js$/, ''),
                abspath: file
            }
        }, (file) => {
            return file.segments.length;
        })).reverse();

        files = _.partition(files, file => file.segments[file.segments.length - 1] == '_global');

        files[0].forEach(file => {
            var router = require(file.abspath);
            if (router) {
                router = router.default || router;
                file.segments.pop();
                saffyre.use('/' + file.segments.join('/'), router);
            }
        });

        files[1].forEach(file => {
            if (file.segments[file.segments.length - 1] == '_default')
                file.segments.pop();

            var router = require(file.abspath);
            router = (router && router.default) || router;
            if (router && router.name == 'router') {
                saffyre.use('/' + file.segments.join('/'), router);
            }
        });
    });

    return saffyre;
};
