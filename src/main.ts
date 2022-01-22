"use strict";

//
// Copyright (c) 2019 D.Thiele All rights reserved.
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
    - add limit for grouplinkings & deeplinkings tohgether
    - text reconnect issue fix
    - catch all possible edit & delte message handlers?

    - add pm select server/user/send commands
    - channel & username notifications -> premium?
    - fix docker
*/

// / / / / / / / / / / / / / / / / / / / / / / //
// / / / / / / / / / / / / / / / / / / / / / / //
// / / /                                 / / / //
// / / /        N  O  T  I  C  E         / / / //
// / / /                                 / / / //
// / / /    Do not modify this file!     / / / //
// / / /    See 'config.js' instead.     / / / //
// / / /                                 / / / //
// / / / / / / / / / / / / / / / / / / / / / / //
// / / / / / / / / / / / / / / / / / / / / / / //

let l = "\r\n / / / / / / / / / / / / / / / / / / / / / / / / / /\r\n";
console.log(l);
console.log(" /        TS3Bot Copyright (c) 2022 D.Thiele        /\r\n");
console.log(" /  This program comes with ABSOLUTELY NO WARRANTY  /\r\n");
console.log(" /   This is free software, and you are welcome to  /\r\n");
console.log(" /     redistribute it under certain conditions;    /\r\n");
console.log(" /           See LICENSE file for details.          /");
console.log(l);

const wait = Date.now() + 5000;
while (Date.now() < wait) {}

// ctx reference (important)
const customCtx = {} as any;

// Load required Libaries
const Path = require("path");
const TelegramBot = require("node-telegram-bot-api");
// Load other Classes
const AntiSpam = require("./class/antispam.js");
const SLOCCount = require("./class/sloc.js");
const FileProxy = require("./class/fileproxy.js");
// load callback handlers
const MessageHandler = require("./class/messagehandler.js");
const ReplyHandler = require("./class/replyhandler.js");

// load config into ctx
require("./config.js")(customCtx);

// load special classes => they store a reference to the main ctx by passing 'customCtx'
// if you require these classes from another one, it will keep the reference when passing 'null'.
const Utils = require("./class/utils.js").Get(customCtx);
const Loader = require("./class/loader.js").Get(customCtx);

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
customCtx.handleEx = (callback) => {
	try {
		callback();
	} catch (ex) {
		ex = customCtx.parseExStr(ex);
		if (customCtx.debug) {
			try {
				customCtx.bot.sendMessage(customCtx.developer_id, "Bot Exception:\r\n" + ex);
			} catch (ex2) {
				ex2 = customCtx.parseExStr(ex2);
				console.log("Fatal Exception: " + ex + ex2);
			}
		} else console.log("Exception: " + ex);
	}
};

// handles bot errors
customCtx.telegramErrorHandler = function (err) {
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
customCtx.actionsPath = Path.join(__dirname, "actions");
customCtx.commandsPath = Path.join(__dirname, "commands");
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
customCtx.deeplinking = new Map();
customCtx.groupnames = new Map();

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
// auto reload modules
Loader.watchModules();
// load data
Loader.loadData();

// save data every 5 minutes
customCtx.autoSave = setInterval(() => {
	Loader.saveData();
}, 300000);

// CREATE BOT

// Create the Telegram Bot either with webhook or polling
let bot = (customCtx.bot = new TelegramBot(
	customCtx.telegram_bot_token,
	customCtx.useWebHook
		? {
				webHook: {
					port: customCtx.webHookPort,
					key: customCtx.webHookCustomCertificate ? customCtx.webKey : null,
					cert: customCtx.webHookCustomCertificate ? customCtx.webCert : null,
					autoOpen: true,
				},
		  }
		: { polling: true }
));

// beware of chair
bot.on("error", customCtx.telegramErrorHandler);
bot.on("polling_error", customCtx.telegramErrorHandler);
bot.on("webhook_error", customCtx.telegramErrorHandler);

// wrapper for storing the last sent bot message and deleting the previous one
bot.sendNewMessage = function (cid, text, opt, noDel) {
	let sendr = cid > 0 ? Utils.getUser({ id: cid }) : null;
	if (!noDel && sendr && sendr.last_bot_msg_id) {
		this.deleteMessage(cid, sendr.last_bot_msg_id);
		sendr.last_bot_msg_id = null;
	}
	return this.sendMessage(cid, text, opt).then((msg) => {
		if (sendr) sendr.last_bot_msg_id = msg.message_id;
	});
};

// clear or set webHook
if (!customCtx.useWebHook) {
	console.log("clearing WebHook... using data polling");
	bot.setWebHook("");
} else {
	let setAddr = "https://" + customCtx.webHookAddr + ":" + customCtx.webHookPort + "/" + customCtx.telegram_bot_token;
	console.log("setting up WebHook: " + setAddr);
	if (customCtx.webHookCustomCertificate) bot.setWebHook(setAddr, customCtx.webCert).then((e) => console.log("Webhook result: " + e));
	else bot.setWebHook(setAddr).then((e) => console.log("WebHook result: " + e));
}

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
bot.getMe().then((res) => {
	customCtx.me = res; // assign self telegram bot object
	console.log("Success. Telegram bot info: " + JSON.stringify(res));
	console.log("Callbacks active.\r\n");

	// listen for messages
	bot.on("message", (msg) => {
		customCtx.handleEx(() => MessageHandler(customCtx, msg));
	});

	// listen for inline Button responses
	bot.on("callback_query", (msg) => {
		if (!customCtx.run) return;
		customCtx.handleEx(() => ReplyHandler(customCtx, msg));
	});
});
