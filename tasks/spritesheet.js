/*
 * grunt-spritesheet
 * https://github.com/nicholasstephan/grunt-spritesheet
 *
 * Mostly just a fork of Ensignten's `grunt-spritesmith` plugin, but 
 * with support for a multiple, and pixel doubled, spritesheets.
 * https://github.com/Ensighten/grunt-spritesmith
 *
 * Copyright (c) 2013 Nicholas Stephan
 * Licensed under the MIT license.
 */

'use strict';

var spritesmith = require('spritesmith');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var Promise = require('node-promise').Promise;
var all = require('node-promise').all;
var mustache = require('mustache');
var im = require('imagemagick');

module.exports = function(grunt) {

	// Create an image from `srcFiles`, with name `destImage`, and pass
	// coordinates to callback.
	function mkSprite(srcFiles, destImage, callback) {
		spritesmith({
			'src': srcFiles,
			'exportOpts': {
				'format': 'png'
			}
		}, function(err, result) {
			// If an error occurred, callback with it
			if (err) {
				grunt.fatal(err);
				return;
			}

			// Otherwise, write out the result to destImg
			var destDir = path.dirname(destImage);
			grunt.file.mkdir(destDir);
			fs.writeFileSync(destImage, result.image, 'binary');

			grunt.log.writeln(destImage, 'created.');

			callback(result.coordinates);
		});
	}

	grunt.registerMultiTask('spritesheet', '@2x your spritesheets.', function() {

		var data = this.data;
		var sprites = data.sprites;
		var sheet = data.sheet;
		var templateUrl = data.templateUrl || __dirname + '/template.mustache';
		var template = fs.readFileSync(templateUrl, 'utf8');

		// Verify all properties are here
		if (!sprites || !sheet) {
			return grunt.fatal("grunt.spritesheet requires a sprites and sheet property");
		}

		// async
		var done = this.async();

		// each sprite adds a promise to promises, then all
		// is used to see when all sprites have been created
		var promises = [];

		// coordinate data fed into the mustache template
		var coords = {std: [], dbl: []};

		// build sprites
		_.each(sprites, function(files, sprite) {
			// get files
			var files = grunt.file.expand(sprites[sprite]);
			var std = _.filter(files, function(file) { return file.indexOf("@2x") === -1; });
			var dbl = _.filter(files, function(file) { return file.indexOf("@2x") !== -1; });

			// discern the prefix from the filename (for now)
			var prefix = path.basename(sprite, '.png');

			// if there are standard res imgs, create sprite
			if(std.length) {
				var stdPromise = new Promise();
				promises.push(stdPromise);

				var url = path.relative(path.dirname(sheet), path.dirname(sprite)) + '/' + path.basename(sprite);

				mkSprite(std, sprite, function(coordinates) {

					Object.getOwnPropertyNames(coordinates).forEach(function(file) {
						var name = path.basename(file, '.png');
						name = prefix + "-" + name;

						file = coordinates[file];

						coords.std.push({
							name: name,
							x: file.x,
							y: file.y,
							width: file.width,
							height: file.height,
							sprite: url
						});
					});

					stdPromise.resolve();
				});
			}

			// if there are double size imgs, determined by @2x in the filename
			if(dbl.length) {
				var dblPromise = new Promise();
				promises.push(dblPromise);
				
				var dblSprite = path.dirname(sprite) + "/" + path.basename(sprite, '.png') + "@2x.png";
				var dblUrl = path.relative(path.dirname(sheet), path.dirname(dblSprite)) + '/' + path.basename(dblSprite);

				mkSprite(dbl, dblSprite, function(coordinates) {

					im.identify(dblSprite, function (err, features) {
						if(err) {
							grunt.fatal(err);
						}

						Object.getOwnPropertyNames(coordinates).forEach(function (file) {
							var name = path.basename(file, '@2x.png');
							name = prefix + "-" + name;
							
							file = coordinates[file];

							coords.dbl.push({
								name: name,
								x: file.x / 2,
								y: file.y / 2,
								width: file.width / 2,
								height: file.height / 2,
								sprite: dblUrl,
								spriteWidth: features.width / 2,
								spriteHeight: features.height / 2
							});
						});

						dblPromise.resolve();
					});

					
				});
			}
		});

		all.apply(null, promises).then(function() {

			var css = mustache.render(template, coords);
			var sheetDir = path.dirname(sheet);
			
			grunt.file.mkdir(sheetDir);
			fs.writeFileSync(sheet, css, 'utf8');

			grunt.log.writeln(sheet, 'created.')
			done();
		});

	});

};
