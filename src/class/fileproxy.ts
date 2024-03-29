"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import http from "http";
import url from "url";
import { nanoid } from "nanoid";

import { TS3BotCtx } from "../context";
import { Telegraf } from "telegraf";
import { CommonMessageBundle } from "telegraf/typings/core/types/typegram";

/**
If someone sends a file to a bot, you usually cant easily share it
and have to download and upload it again in order to hide the bot token from the URL.
However, this fancy 'fileproxy' will 'stream' the downloads, without taking any space
- just bandwidth :)
This way you can also access the file after the 1h valid-period of file downloads..
Sadly Telegram limits the downloads for bot files to 20MB size and 2mb/s..  ;-(

Proxy takes /?sid= parameter aka "shortid" which is internally mapped to the "file_id",
then requests the actual link for telegram and starts streaming the content.
 */
export class FileProxy {
	Parent: TS3BotCtx;
	bot: Telegraf;

	address: string;
	port: any;

	constructor(parent: TS3BotCtx, address, port?) {
		this.Parent = parent;
		this.bot = parent.bot;
		this.address = address;

		if (!port) port = 8443;
		this.port = port;

		http.createServer((request, response) => {
			const params = this.getParams(request);
			const s_id = params["sid"] || null;
			const file_id = this.Parent.fileMappings[s_id] ? this.Parent.fileMappings[s_id] || null : null;
			if (s_id === null || file_id === null) {
				console.log("fileproxy Error: sid not given: " + JSON.stringify(request));
				response.write("No sid.");
				response.end();
			} else {
				console.log("proxying file with id: " + file_id);
				this.bot.telegram
					.getFile(file_id)
					.then((lnk) => {
						const lpath = "https://api.telegram.org/file/bot" + this.Parent.settings.telegram_bot_token + "/" + lnk.file_path;
						const options = {
							method: "GET",
							host: url.parse(lpath).host,
							port: 80,
							path: url.parse(lpath).pathname,
						};
						const proxy_request = http.request(options, (proxy_response) => {
							proxy_response.on("data", (chunk) => {
								response.write(chunk, "binary");
								//console.log('data: ' + JSON.stringify(chunk));
							});
							proxy_response.on("end", () => {
								response.end();
							});
							proxy_response.on("error", () => {
								response.end();
							});
							response.writeHead(proxy_response.statusCode || 200, proxy_response.headers);
							//console.log('Polling data.. ');
						});
						request.addListener("data", function (chunk) {
							proxy_request.write(chunk, "binary");
						});
						request.addListener("end", () => {
							proxy_request.end();
						});
					})
					.catch((ex) => {
						response.write("request error: " + ex);
						response.end();
						console.log("request error: " + ex);
					});
			}
		}).listen(port);
		console.log("FileProxy listening on port: " + port);
	}

	// splits url params
	getParams(req) {
		const q = req.url.split("?"),
			result = {};
		if (q.length >= 2) {
			q[1].split("&").forEach((item) => {
				try {
					result[item.split("=")[0]] = item.split("=")[1];
				} catch (e) {
					result[item.split("=")[0]] = "";
				}
			});
		}
		return result;
	}

	// builds URL and inserts the file mapping
	getURL(msg: CommonMessageBundle, filetype: string) {
		let fa;
		if (filetype == "photo") {
			//console.log(msg[filetype]);
			let photo;
			for (const phot of msg[filetype]) {
				if (!photo || photo.file_size < phot.file_size) photo = phot;
			}
			fa = photo.file_id;
		} else fa = msg[filetype].file_id;
		const sid = nanoid();
		this.Parent.fileMappings[sid] = fa;
		return "http://" + this.address + ":" + this.port + "/?sid=" + sid;
	}
}
