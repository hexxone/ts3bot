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
    - add limit for grouplinkings & deeplinkings together
    - text reconnect issue fix
    - catch all possible edit & delte message handlers?

    - add pm select server/user/send commands
	- catch send/edit/delete telegram permission error -> unlink
	- test everything
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
import SLOCCount from "./class/sloc";
import MessageHandler from "./handler/messagehandler";
import ReplyHandler from "./handler/replyhandler";

// load Objects
import { GroupLinking } from "./object/grouplinking";

// load special classes => they store a reference to the main ctx by passing 'customCtx'
// if you require these classes from another one, it will keep the reference when passing 'null'.
import Utils from "./class/utils";
import Loader from "./class/loader";

import Configure from "./config";

let l = " --------------------------------------------------";
console.log(l);
console.log("|        TS3Bot Copyright (c) 2022 D.Thiele        |");
console.log("|  This program comes with ABSOLUTELY NO WARRANTY  |");
console.log("|   This is free software, and you are welcome to  |");
console.log("|     redistribute it under certain conditions;    |");
console.log("|           See LICENSE file for details.          |");
console.log(l + "\r\n");

// hook console.log to always include time from now
const log = console.log;
console.log = function () {
	log.apply(console, ["[" + Utils.getTime(new Date()) + "]"].concat(arguments.length > 1 ? arguments : arguments[0]));
};

console.log("Bot running from directory: " + __dirname);
const wait = Date.now() + 5000;
while (Date.now() < wait) {}

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
	slocCount: 0,
	receivedMessages: 0,

	settings,
	antispam: new AntiSpam(10),

	handleEx: (callback: () => void) => {
		try {
			callback();
		} catch (ex: any) {
			ex = parseExStr(ex);
			if (customCtx.settings.debug) {
				try {
					customCtx.bot.telegram.sendMessage(customCtx.settings.developer_id, "Bot Exception:\r\n" + ex, { disable_web_page_preview: true });
				} catch (ex2) {
					ex2 = parseExStr(ex2);
					console.log("Fatal Exception: " + ex + ex2);
				}
			} else console.log("Exception: " + ex);
		}
	},

	exitHandler: (opt, err) => {
		if (err) console.log(err);
		if (opt && opt.exit) {
			for (let instance of customCtx.instances) instance.Disconnect();
			Loader.saveData();
			console.log("[TS3Bot|Exit]");
			process.exit(0);
		}
	},
} as TS3BotCtx;

SLOCCount((arg) => {
	customCtx.slocCount = arg;
	console.log("SLOC result : " + arg);
});

Utils.Set(customCtx);
Loader.Set(customCtx);

// SOME IMPORTANT HELPER FUNCTIONS

// parses string for an exception (Result shall never be sent to a normal user!!!)
const parseExStr = (ex) =>
	JSON.stringify(
		{
			code: ex.code,
			msg: ex.message,
			stack: ex.stack,
		},
		null,
		4
	);

// dont close the process immediately
process.stdin.resume();

// register app closing handler
process.on("exit", customCtx.exitHandler.bind(null, {}));
// register uncaught exception handler
process.on("uncaughtException", customCtx.exitHandler.bind(null, {}));
// register ctrl+c closing handler
process.on("SIGINT", customCtx.exitHandler.bind(null, { exit: true }));

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

// wrapper for storing the last sent bot message and deleting the previous one
customCtx.sendNewMessage = async (cid: number, text: string, opt: ExtraReplyMessage, noDel: boolean) => {
	let sendr = cid > 0 ? Utils.getUser({ id: cid }) : null;
	if (!noDel && sendr && sendr.last_bot_msg_id > 0) {
		await bot.telegram.deleteMessage(cid, sendr.last_bot_msg_id).catch((ex) => {
			// @todo is bot only forbidden to delete messages, or is message too old, or did he get removed from chat?
		});
		sendr.last_bot_msg_id = -1;
	}
	// set defaults
	if (opt === undefined) opt = {};
	if (opt.parse_mode === undefined) opt.parse_mode = "HTML";
	if (opt.disable_web_page_preview === undefined) opt.disable_web_page_preview = true;
	return bot.telegram
		.sendMessage(cid, text, opt)
		.then((msg) => {
			if (sendr) sendr.last_bot_msg_id = msg.message_id;
			return msg;
		})
		.catch((err) => {
			// @todo is bot forbidden to send messages => got removed from chat/blocked ?
			// destroy chat linkings / user instances
			console.error("@TODO", err);
			return undefined;
		});
};

// create Fileproxy?
// init file proxy
if (settings.useFileProxy) {
	customCtx.fileProxyServer = new FileProxy(customCtx);
	customCtx.fileProxyServer.init(bot, settings.fileProxyAddr, settings.fileProxyPort);
}

// print stats
//console.log('Stats:' + Utils.getStats(Utils.getLanguageMessages(self2.defaultLanguage)));

customCtx.run = false;
customCtx.me; // contains the bot's info object
customCtx.receivedMessages = 0;

console.log("connecting to Telegram bot API...");

// get telegram bot object
bot.telegram.getMe().then((res) => {
	customCtx.me = res; // assign self telegram bot object

	console.log("Success. Telegram bot info: " + JSON.stringify(res));
	console.log("Callbacks active.\r\n");

	// listen for messages
	MessageHandler(customCtx);

	// listen for inline Button responses
	ReplyHandler(customCtx);

	// Enable graceful stop
	process.once("SIGINT", () => bot.stop("SIGINT"));
	process.once("SIGTERM", () => bot.stop("SIGTERM"));
});
