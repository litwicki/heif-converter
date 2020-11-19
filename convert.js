#!/usr/bin/env node
'use strict';

require('dotenv').config()
const exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
const { exit } = require('process');

const sourceDir = process.env.SOURCE_DIRECTORY;

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
            if(path.extname(sourceDir + file) == '.HEIC') {
                let output = file.substr(0, file.lastIndexOf(".")) + ".jpg";
                exec('heif-convert -q 100 ' + file + ' ' + output);
                if(process.env.DELETE_ORIGINAL) {
                    exec('rm ' + file);
                }
                results.push(file);
            }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk(sourceDir, function(err, results) {
    if (err) throw err;
    console.log(results);
  });