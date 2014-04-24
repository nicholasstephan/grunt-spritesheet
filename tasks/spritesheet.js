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
	function mkSprite(srcFiles, destImage, options, callback) {

		options.src = srcFiles;

		grunt.verbose.writeln('Options passed to Spritesmth:', JSON.stringify(options));

		spritesmith(options, function(err, result) {
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

		var data = this.data,
			sprites = data.sprites,
			sheet = data.sheet,
			templateUrl = data.templateUrl || __dirname + '/template.mustache',
			template = fs.readFileSync(templateUrl, 'utf8'),
			spritesmithOptions = data.spritesmithOptions || {},

			// each sprite adds a promise to promises, then all
			// is used to see when all sprites have been created
			promises = [];

		// Verify all properties are here
		if (!sprites || !sheet) {
			return grunt.fatal("grunt.spritesheet requires a sprites and sheet property");
		}

		// async
		var done = this.async(),
		// coordinate data fed into the mustache template
			coords = {
				std: [],
				dbl: [],
				targets: [],
				data:this.data,
				config:grunt.config.get()
			};

		// build sprites
		_.each(sprites, function(afiles, sprite) {
			// get files
			var files = grunt.file.expand(sprites[sprite]),
				std = _.filter(files, function(file) { return file.indexOf("@2x") === -1; }),
				dbl = _.filter(files, function(file) { return file.indexOf("@2x") !== -1; }),
				target = {
					out : sprite,
					std : [],
					dbl : []
				},
				ext = path.extname(sprite), // discern the prefix from the filename (for now)
				prefix = path.basename(sprite, ext),
				options = _.extend({
						'exportOpts': {
							'format': ext.slice(1)
						}
					}, spritesmithOptions);

			// if there are standard res imgs, create sprite
			if(std.length) {

				var stdPromise = new Promise(),
					url = path.relative(path.dirname(sheet), path.dirname(sprite)) + '/' + path.basename(sprite);

				promises.push(stdPromise);

				mkSprite(std, sprite, options, function(coordinates) {

					Object.getOwnPropertyNames(coordinates).forEach(function(file) {
						var name = path.basename(file, ext),
							std_data = {};

						name = prefix + "-" + name;
						file = coordinates[file];
						std_data = {
							name: name,
							x: file.x,
							y: file.y,
							width: file.width,
							height: file.height,
							sprite: url
						};
						coords.std.push(std_data);
						target.std.push(std_data);
					});

					stdPromise.resolve();

				});
			}

			// if there are double size imgs, determined by @2x in the filename
			if(dbl.length) {

				var dblPromise = new Promise(),
					dblSprite = path.dirname(sprite) + "/" + path.basename(sprite, ext) + "@2x" + ext,
					dblUrl = path.relative(path.dirname(sheet), path.dirname(dblSprite)) + '/' + path.basename(dblSprite);

				promises.push(dblPromise);

				// Double padding if it is set
				if (typeof options.padding === 'number') {
					options.padding *= 2;
				}

				mkSprite(dbl, dblSprite, options, function(coordinates) {

					im.identify(dblSprite, function (err, features) {
						if(err) {
							grunt.fatal(err);
						}

						Object.getOwnPropertyNames(coordinates).forEach(function (file) {

							var name = path.basename(file, '@2x' + ext),
								dbl_data = {};

							name = prefix + "-" + name;
							file = coordinates[file];
							dbl_data = {
								name: name,
								x: file.x / 2,
								y: file.y / 2,
								width: file.width / 2,
								height: file.height / 2,
								sprite: dblUrl,
								spriteWidth: features.width / 2,
								spriteHeight: features.height / 2
							};
							coords.dbl.push(dbl_data);
							target.dbl.push(dbl_data);
						});

						dblPromise.resolve();

					});

				});
			}
			coords.targets.push(target);
		});

		all.apply(null, promises).then(function() {

			var css = mustache.render(template, coords),
				sheetDir = path.dirname(sheet);

			grunt.file.mkdir(sheetDir);
			fs.writeFileSync(sheet, css, 'utf8');

			grunt.log.writeln(sheet, 'created.');
			done();
		});

	});

};
