'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//


// if someone sends a bot a file, you cant easily share it. You have to usually down-and upload it again.
// However, this is 'fileproxy" is a small application to "stream'  the Telegram downloads,
// without taking any space - just bandwidth :) I created this so you can easily access the file
// after 1h of the time a Telegram link is valid and to hide the bot token from the URL.
// it takes ?sid= parameter => shortid => file_id to request link for
const http = require('http');
const url = require('url');
const shortid = require('shortid');

class FileProxy {

	constructor(parent) {
		this.Parent = parent;
	}

	// initialize actual server
	init(bot, address, port) {
		if (!bot) throw 'Bot not given!';
		if (!port) port = 8443;

		this.bot = bot;
		this.address = address;
		this.port = port;

		http.createServer((request, response) => {
			console.log('incoming proxy request: ' + request);
			let params = this.getParams(request);
			let s_id = params['sid'] || null;
			let file_id = shortid.isValid(s_id) ? this.Parent.fileMappings[s_id] || null : null;
			if (s_id === null || file_id === null) {
				console.log('fileproxy Error: sid not given: ' + request);
				response.write('No sid.');
				response.end();
			} else {
				console.log('proxying file with id: ' + file_id);
				this.bot.getFile(file_id).then(lnk => {
					//console.log('request lnk 4 fid: " + file_id + " result: ' + JSON.stringify(lnk));
					let lpath = 'https://api.telegram.org/file/bot' + this.Parent.telegram_bot_token + '/' + lnk.file_path;
					let options = {
						method: 'GET',
						host: url.parse(lpath).host,
						port: 80,
						path: url.parse(lpath).pathname,
					};
					let proxy_request = http.request(options, proxy_response => {
						proxy_response.on('data', chunk => {
							response.write(chunk, 'binary');
							//console.log('data: ' + JSON.stringify(chunk));
						});
						proxy_response.on('end', () => {
							response.end();
						});
						proxy_response.on('error', () => {
							response.end();
						});
						response.writeHead(proxy_response.statusCode, proxy_response.headers);
						//console.log('Polling data.. ');
					});
					request.addListener('data', function (chunk) {
						proxy_request.write(chunk, 'binary');
					});
					request.addListener('end', () => {
						proxy_request.end();
					});
				}).catch(ex => {
					response.write('request error: ' + ex);
					response.end();
					console.log('request error: ' + ex);
				});
			}

		}).listen(port);
		console.log('FileProxy listening on port: ' + port);
	}

	// splits url params
	getParams(req) {
		let q = req.url.split('?'),
			result = {};
		if (q.length >= 2) {
			q[1].split('&').forEach((item) => {
				try {
					result[item.split('=')[0]] = item.split('=')[1];
				} catch (e) {
					result[item.split('=')[0]] = '';
				}
			});
		}
		return result;
	}

	// builds URL
	getURL(msg, filetype) {
		let fa;
		if (filetype == 'photo') {
			//console.log(msg[filetype]);
			let photo;
			for (let phot of msg[filetype]) {
				if (!photo || photo.file_size < phot.file_size)
					photo = phot;
			}
			fa = photo.file_id;
		}
		else fa = msg[filetype].file_id;
		let sid = shortid.generate();
		this.Parent.fileMappings[sid] = fa;
		return 'http://' + this.address + ':' + this.port + '/?sid=' + sid;
	}
}

module.exports = FileProxy;
