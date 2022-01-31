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
	- default html formatting
	- catch group send telegram permission error -> unlink
	- test everything
*/

let l = " --------------------------------------------------";
console.log(l);
console.log("|        TS3Bot Copyright (c) 2022 D.Thiele        |");
console.log("|  This program comes with ABSOLUTELY NO WARRANTY  |");
console.log("|   This is free software, and you are welcome to  |");
console.log("|     redistribute it under certain conditions;    |");
console.log("|           See LICENSE file for details.          |");
console.log(l + "\r\n");

const wait = Date.now() + 5000;
while (Date.now() < wait) {}

// main Context reference
// will keep all important objects and settings
import { TS3Ctx } from "./context";
const customCtx = {} as TS3Ctx;

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

// load config into ctx
import conf from "./config";
conf(customCtx);

// load special classes => they store a reference to the main ctx by passing 'customCtx'
// if you require these classes from another one, it will keep the reference when passing 'null'.
import Utils from "./class/utils";
import Loader from "./class/loader";

Utils.Set(customCtx);
Loader.Set(customCtx);

// hook console.log to always include time
const log = console.log;
console.log = function () {
	log.apply(console, ["[" + Utils.getTime() + "]"].concat(arguments.length > 1 ? arguments : arguments[0]));
};

// set our start time, cuz why not
customCtx.startDate = Utils.getTime();
console.log("Bot running from directory: " + __dirname);
console.log("Static classes loaded.");

// SOME IMPORTANT HELPER FUNCTIONS

// parses string for an exception (Result shall never be sent to a normal user!!!)
customCtx.parseExStr = (ex) =>
	JSON.stringify(
		{
			code: ex.code,
			msg: ex.message,
			stack: ex.stack,
		},
		null,
		4
	);

// custom Exception Handler
customCtx.handleEx = (callback: () => void) => {
	try {
		callback();
	} catch (ex: any) {
		ex = customCtx.parseExStr(ex);
		if (customCtx.debug) {
			try {
				customCtx.bot.telegram.sendMessage(customCtx.developer_id, "Bot Exception:\r\n" + ex, { disable_web_page_preview: true });
			} catch (ex2) {
				ex2 = customCtx.parseExStr(ex2);
				console.log("Fatal Exception: " + ex + ex2);
			}
		} else console.log("Exception: " + ex);
	}
};

// handles bot errors
customCtx.telegramErrorHandler = function (err: any) {
	console.error("Telegram Exception", JSON.stringify(err).substring(0, 100));
};

// handles any closing of the program
customCtx.exitHandler = function (opt, err) {
	if (err) console.log(err);
	if (opt && opt.exit) {
		for (let instance of customCtx.instances) instance.Disconnect();
		Loader.saveData();
		console.log("[TS3Bot|Exit]");
		process.exit(0);
	}
};

// INIT DYNAMIC RESOURCES

// Get module paths
customCtx.actionsPath = Path.join(__dirname, "action");
customCtx.commandsPath = Path.join(__dirname, "command");
customCtx.languagesPath = Path.join(__dirname, "msg");

// Create module arrays
customCtx.actions = [];
customCtx.commands = [];
customCtx.languages = [];

// Create object arrays
customCtx.users = [];
customCtx.instances = [];
customCtx.linkings = [];

// Create array objects
customCtx.fileMappings = {};
customCtx.announces = {};

// Create Hash-Maps
customCtx.deeplinking = new Map<string, GroupLinking>();
customCtx.groupnames = new Map<number, string>();

// should not close instantly
process.stdin.resume();
// register app closing handler
process.on("exit", customCtx.exitHandler.bind(null, {}));
// register uncaught exception handler
process.on("uncaughtException", customCtx.exitHandler.bind(null, {}));
// register ctrl+c closing handler
process.on("SIGINT", customCtx.exitHandler.bind(null, { exit: true }));

// LOAD ACTIONS AND COMMANDS

SLOCCount((arg) => {
	customCtx.slocCount = arg;
	console.log("SLOC result : " + arg);
});

// create Fileproxy?
customCtx.fileProxyServer = new FileProxy(customCtx);

// initial loading
Loader.loadModules();
// load data
Loader.loadData();

// autosave data every 5 minutes
setInterval(() => {
	Loader.saveData();
}, 5 * 60 * 1000);

// CREATE BOT

// Create the Telegram Bot either with webhook or polling
let bot = (customCtx.bot = new Telegraf(customCtx.telegram_bot_token));

if (customCtx.useWebHook) {
	// Start https webhook
	if (customCtx.webHookCustomCertificate) {
		bot.launch({
			webhook: {
				host: customCtx.webHookAddr,
				port: customCtx.webHookPort,
				tlsOptions: {
					cert: fs.readFileSync(customCtx.webCert),
					key: fs.readFileSync(customCtx.webKey),
					ca: [
						// This is necessary only if the client uses a self-signed certificate.
						fs.readFileSync(customCtx.webCert),
					],
				},
			},
		});
	} else {
		bot.launch({
			webhook: {
				host: customCtx.webHookAddr,
				port: customCtx.webHookPort,
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

// Spam protection wrapper
customCtx.antispam = new AntiSpam(10);

// init file proxy
if (customCtx.useFileProxy) {
	customCtx.fileProxyServer.init(bot, customCtx.fileProxyAddr, customCtx.fileProxyPort);
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
