"use strict";

var express = require('express');
var readdir = require('recursive-readdir');
var _ = require('underscore');

module.exports = function (dir, options) {
  _.defaults(options, {
    ext: ['js']
  });

  var saffyre = express.Router();

  readdir(dir, function (e, files) {

    var fileExtRegex = new RegExp('\\.(' + options.ext.join('|') + ')$');

    files = _.chain(files)
      .filter(file => file.match(fileExtRegex))
      .map(file => {
        var path = file.replace(dir + '/', '');
        return {
          segments: path.replace(fileExtRegex, '').split('/'),
          path: path.replace(fileExtRegex, ''),
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
