"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. See 'LICENSE.txt' file in project root.
//
// If not, visit <https://www.gnu.org/licenses/> for full license information.
//

/*
    @TODO-LIST
    - catch all possible edit & delte message handlers?

	~ fix TOS <code>
	~ fix link <ts3 server> -> real name
	- fix linkings group links
	~ catch send/(edit)/delete telegram permission error -> unlink
	~ test everything
*/

// main Context reference
// will keep all important objects and settings
import { TS3BotCtx } from "./context";

// Load required Libaries
import fs from "fs";
import Path from "path";
import { Telegraf } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

// Load Classes
import { AntiSpam } from "./class/antispam";
import { FileProxy } from "./class/fileproxy";

// load callback handlers
import MessageHandler from "./handler/messagehandler";
import ReplyHandler from "./handler/replyhandler";

// load Objects
import { GroupLinking } from "./object/grouplinking";

// load special classes => they store a reference to the main ctx by passing 'customCtx'
// if you require these classes from another one, it will keep the reference when passing 'null'.
import Utils from "./class/utils";
import Loader from "./class/loader";

import Configure from "./config";
import { User } from "./object/user";

let l = "+-------------------------------------------------+";
console.log(l);
console.log("|        TS3Bot Copyright (c) 2022 hexxone        |");
console.log("|       This bot comes without ANY WARRANTY       |");
console.log("|  This is free software, and you are welcome to  |");
console.log("|    redistribute it under certain conditions;    |");
console.log("|          See LICENSE file for details.          |");
console.log(l + "\r\n");

// hook console.log to always include time from now
const clog = console.log;
const cifo = console.info;
const cerr = console.error;
const logApply = (args) => ["[" + Utils.getTime(new Date()) + "]"].concat(args.length > 1 ? args : args[0]);
console.log = (...args) => clog.apply(console, logApply(args));
console.info = (...args) => cifo.apply(console, logApply(args));
console.error = (...args) => cerr.apply(console, logApply(args));

console.log("Running from directory: " + __dirname);

// load config into ctx
const settings = Configure();

const customCtx = {
	startDate: new Date(),
	actionsPath: Path.join(__dirname, "action"),
	commandsPath: Path.join(__dirname, "command"),
	languagesPath: Path.join(__dirname, "msg"),

	actions: new Array(),
	commands: new Array(),
	languages: new Array(),

	users: new Array(),
	instances: new Array(),
	linkings: new Array(),

	fileMappings: {},
	announces: {},

	deeplinking: new Map<string, GroupLinking>(),
	groupnames: new Map<number, string>(),
	receivedMessages: 0,

	settings,
	antispam: new AntiSpam(10),
} as TS3BotCtx;

Utils.Set(customCtx);
Loader.Set(customCtx);

// LOAD ACTIONS, COMMANDS & DATA
Loader.loadModules();
Loader.loadData();

// autosave data every 5 minutes
setInterval(() => {
	Loader.saveData();
}, 5 * 60 * 1000);

// CREATE BOT

// Create the Telegram Bot either with webhook or polling
let bot = (customCtx.bot = new Telegraf(settings.telegram_bot_token));
if (settings.useWebHook) {
	// Start https webhook
	if (settings.webHookCustomCertificate) {
		bot.launch({
			webhook: {
				host: settings.webHookAddr,
				port: settings.webHookPort,
				tlsOptions: {
					cert: fs.readFileSync(settings.webCert),
					key: fs.readFileSync(settings.webKey),
					ca: [
						// This is necessary only if the client uses a self-signed certificate.
						fs.readFileSync(settings.webCert),
					],
				},
			},
		});
	} else {
		bot.launch({
			webhook: {
				host: settings.webHookAddr,
				port: settings.webHookPort,
			},
		});
	}
} else {
	// polling
	bot.launch();
}

// wrapper for deleting the previous bot message, sending a new one and storing its id.
// will also try to handle some telegram errors by removing servers/links.
customCtx.sendNewMessage = async (cid: number, text: string, opt: ExtraReplyMessage, noDel: boolean) => {
	// get the target chat object
	const sendr = cid > 0 ? Utils.getUser({ id: cid }) : Utils.getGroupLinking(cid);
	let noStore = false;
	// try to delte the old message
	if (!noDel && sendr && sendr.last_bot_msg_id > 0) {
		await bot.telegram.deleteMessage(cid, sendr.last_bot_msg_id).catch((ex) => {
			// @todo is bot only forbidden to delete messages, or is message too old, or did he get removed from chat?
			noStore = true;
		});
		sendr.last_bot_msg_id = -1;
	}
	// set defaults
	if (opt === undefined) opt = {};
	if (opt.parse_mode === undefined) opt.parse_mode = "HTML";
	if (opt.disable_web_page_preview === undefined) opt.disable_web_page_preview = true;
	// send actual message
	return bot.telegram
		.sendMessage(cid, text, opt)
		.then((msg) => {
			if (sendr && !noStore) sendr.last_bot_msg_id = msg.message_id;
			return msg;
		})
		.catch((err: Error) => {
			if (settings.debug) console.error(err, cid, text, opt);
			// bot forbidden to send messages => got removed from chat/blocked/stopped ?
			// @todo test
			const etl = err.message.toLocaleLowerCase();
			if (etl.includes("forbidden") || etl.includes("not found") || etl.includes("blocked") || etl.includes("stopped")) {
				// destroy chat linkings / user instances
				if (!sendr) console.error("FATAL: Unkown sender error", err);
				else if (sendr instanceof User) {
					Utils.destroyUser(sendr);
				} else if (sendr instanceof GroupLinking) {
					Utils.destroyGroupLinking(sendr, true);
				}
			}
			return undefined;
		});
};

// CTRL + C handler
const exitHandler = (opt, err) => {
	if (err) console.error("exitHandler", err);
	if (opt && opt.exit) {
		bot.stop(err); // SIGINT & SIGTERM registered
		for (let instance of customCtx.instances) instance.Disconnect();
		Loader.saveData();
		console.info("[TS3Bot|Exit]");
		process.exit(0);
	} else if (err) {
		if (customCtx.settings.debug) {
			try {
				customCtx.bot.telegram.sendMessage(customCtx.settings.developer_id, "Bot Exception:\r\n" + err, { disable_web_page_preview: true });
			} catch (ex2) {
				console.error("Fatal Exception: " + err + ex2);
				process.exit(1);
			}
		}
	}
};

// register app handlers
const registerExitHandlers = () => {
	process.on("exit", exitHandler.bind(null, {}));
	process.on("uncaughtException", exitHandler.bind(null, {}));
	process.on("SIGINT", exitHandler.bind(null, { exit: true }));
	process.on("SIGTERM", exitHandler.bind(null, { exit: true }));
	// dont close the process
	process.stdin.resume();
};

// create Fileproxy?
if (settings.useFileProxy) customCtx.fileProxyServer = new FileProxy(customCtx, settings.fileProxyAddr, settings.fileProxyPort);

console.log("connecting to Telegram bot API...");

// get telegram bot object
bot.telegram.getMe().then((res) => {
	customCtx.me = res; // assign self telegram bot object

	console.log("Success. Telegram bot info: " + JSON.stringify(res));

	// listen for messages
	MessageHandler(customCtx);

	// listen for inline Button responses
	ReplyHandler(customCtx);

	// print stats
	console.log("Stats:" + Utils.getStats(Utils.getLanguageMessages()));

	registerExitHandlers();

	console.log("Running.\r\n");
});
