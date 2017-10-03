"use strict";

var express = require('express');
var readdir = require('recursive-readdir');
var _ = require('underscore');

module.exports = function (dir) {

  var saffyre = express.Router();

  readdir(dir, function (e, files) {

    files = _.chain(files)
      .filter(file => file.match(/\.js$/))
      .map(file => {
        var path = file.replace(dir + '/', '');
        return {
          segments: path.replace(/\.js$/, '').split('/'),
          path: path.replace(/\.js$/, ''),
          abspath: file
        }
      })
      .sortBy(file => {
        return file.segments.length;
      })
      .reverse()
      .partition(file => file.segments[file.segments.length - 1] === '_global')
      .value();

    files[0].forEach(file => {
      var router = require(file.abspath);
      if (router) {
        router = router.default || router;
        file.segments.pop();
        saffyre.use('/' + file.segments.join('/'), router);
      }
    });

    files[1].forEach(file => {
      if (file.segments[file.segments.length - 1] === '_default')
        file.segments.pop();

      var router = require(file.abspath);
      router = (router && router.default) || router;
      if (router && router.name === 'router') {
        saffyre.use('/' + file.segments.join('/'), router);
      }
    });
  });

  return saffyre;
};
