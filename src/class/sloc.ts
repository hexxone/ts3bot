"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import fs from "fs";
import path from "path";
import sloc from "sloc";

// Counts siginificant lines of code for all files in src.
// if other files than .js are added, the params need to be adjusted.
export default (callme: (sloc: number) => void) => {
	console.log("asynchronously counting significant lines of code (SLOC)...");
	let slocc = 0;
	let walk = function (dir, done) {
		let results = [] as string[];
		fs.readdir(dir, function (err, list) {
			if (err) return done(err);
			let i = 0;
			(function next() {
				let file = list[i++];
				if (!file) return done(null, results);
				file = path.resolve(dir, file);
				fs.stat(file, function (err, stat) {
					if (stat && stat.isDirectory()) {
						walk(file, function (err, res) {
							results = results.concat(res);
							next();
						});
					} else {
						results.push(file);
						next();
					}
				});
			})();
		});
	};
	let fcount = function (file, done) {
		let cnt = 0;
		fs.readFile(file, "utf8", function (err, code) {
			if (err) {
				console.error(err);
			} else {
				let stats = sloc(code, "js");
				slocc += stats.source;
				done();
			}
		});
		return cnt;
	};
	let sloop = function (elements) {
		if (elements.length > 0) {
			let elem = elements[0];
			elements.splice(0, 1);
			fcount(elem, function () {
				sloop(elements);
			});
		} else callme(slocc);
	};
	walk("./src/", function (err, results) {
		if (err) throw err;
		sloop(results);
	});
};
