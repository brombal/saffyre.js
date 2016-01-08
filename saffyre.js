"use strict";

var express = require('express');
var readdir = require('recursive-readdir');
var _ = require('underscore');
var chokidar = require('chokidar');

module.exports = function(dir, options) {

    var saffyre = express.Router();

    function loadFiles() {
        readdir(dir, function(e, files) {

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
                    file.segments.pop();
                    saffyre.use('/' + file.segments.join('/'), router);
                }
            });

            files[1].forEach(file => {
                if (file.segments[file.segments.length - 1] == '_default')
                    file.segments.pop();

                var router = require(file.abspath);
                if (router && router.name == 'router') {
                    saffyre.use('/' + file.segments.join('/'), router);
                }
            });
        });
    }

    if (options.watch)
    {
        chokidar.watch(dir).on('all', function(event, file) {
            if(event === 'change') {
                saffyre.stack = [];
                delete require.cache[require.resolve(file)];
                loadFiles();
            }
        });
    }

    loadFiles();

    return saffyre;
};
