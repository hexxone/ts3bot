'use strict';

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
    x livetree
    - fix command id's
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

let l = '\r\n / / / / / / / / / / / / / / / / / / / / / / / / / /\r\n';
console.log(l + ' /   TS3TelegramBot Copyright (c) 2019 D.Thiele    /\r\n / This program comes with ABSOLUTELY NO WARRANTY; /\r\n /  This is free software, and you are welcome to  /');
console.log(' /    redistribute it under certain conditions;    /\r\n /          See LICENSE file for details.          /' + l);

const wait = new Date(Date.now() + 5000);
while (Date.now() < wait) { }

// ctx reference (important)
const self = this;

// Load required Libaries
const Path = require('path');
const TelegramBot = require('node-telegram-bot-api');
// Load other Classes 
const AntiSpam = require('./class/antispam.js');
const SLOCCount = require('./class/sloc.js');
const FileProxy = require('./class/fileproxy.js');
// load callback handlers
const MessageHandler = require('./class/messagehandler.js');
const ReplyHandler = require('./class/replyhandler.js');

// load config into ctx
require('./config.js')(self);

// load special classes => they store a reference to the main ctx by passing 'self'
// if you require these classes from another one, it will keep the reference when passing 'null'.
const Utils = require('./class/utils.js').Get(self);
const Loader = require('./class/loader.js').Get(self);

// hook console.log to always include time
const log = console.log;
console.log = function () {
    log.apply(console, ['[' + Utils.getTime() + ']'].concat(arguments.length > 1 ? arguments : arguments[0]));
}

// set our start time, cuz why not
self.startDate = Utils.getTime();
console.log('Bot running from directory: ' + __dirname);
console.log('Static classes loaded.')

// SOME IMPORTANT HELPER FUNCTIONS

// parses string for an exception (Result shall never be sent to a normal user!!!)
self.parseExStr = (ex) => JSON.stringify({
    code: ex.code,
    msg: ex.message,
    stack: ex.stack
}, null, 4);

// custom Exception Handler
self.handleEx = (callback) => {
    try {
        callback();
    } catch (ex) {
        ex = self.parseExStr(ex);
        if (self.debug) {
            try {
                self.bot.sendMessage(self.developer_id, 'Bot Exception:\r\n' + ex);
            } catch (ex2) {
                ex2 = self.parseExStr(ex2);
                console.log('Fatal Exception: ' + ex + ex2);
            }
        }
        else console.log('Exception: ' + ex);
    }
};

// handles bot errors
self.telegramErrorHandler = function (err) {
    console.error('Telegram Exception', JSON.stringify(err).substring(0, 100));
};

// handles any closing of the program
self.exitHandler = function (opt, err) {
    if (err) console.log(err);
    if (opt && opt.exit) {
        for (let instance of self.instances)
            instance.Disconnect(false, false);
        Loader.saveData();
        console.log('[TS3Bot|Exit]');
        process.exit(0);
    }
};

// INIT DYNAMIC RESOURCES

// Get module paths
self.actionsPath = Path.join(__dirname, 'actions');
self.commandsPath = Path.join(__dirname, 'commands');
self.languagesPath = Path.join(__dirname, 'msg');
// Create module arrays
self.actions = [];
self.commands = [];
self.languages = [];
// Create object arrays
self.users = [];
self.instances = [];
self.linkings = [];
// Create array objects
self.fileMappings = {};
self.announces = {};
// Create Hash-Maps
self.deeplinking = new Map();
self.groupnames = new Map();

// should not close instantly
process.stdin.resume();
// register app closing handler
process.on('exit', self.exitHandler.bind(null, {}));
// register uncaught exception handler
process.on('uncaughtException', self.exitHandler.bind(null, {}));
// register ctrl+c closing handler
process.on('SIGINT', self.exitHandler.bind(null, { exit: true }));

// LOAD ACTIONS AND COMMANDS

SLOCCount((arg) => {
    self.slocCount = arg;
    console.log('SLOC result : ' + arg);
});

// create Fileproxy?
self.fileProxyServer = new FileProxy(self);

// initial loading 
Loader.loadModules();
// auto reload modules
Loader.watchModules();
// load data
Loader.loadData();

// load curses
self.lolcurses = require('fs').readFileSync('./data/curses.txt').toString().split('\r\n');

// save data every 5 minutes
self.autoSave = setInterval(() => {
    Loader.saveData();
}, 300000);

// CREATE BOT

// Create the Telegram Bot either with webhook or polling
let bot = self.bot = new TelegramBot(self.telegram_bot_token, self.useWebHook ?
    {
        webHook: {
            port: self.webHookPort,
            key: self.webHookCustomCertificate ? self.webKey : null,
            cert: self.webHookCustomCertificate ? self.webCert : null,
            autoOpen: true
        }
    }
    : { polling: true });

// beware of chair
bot.on('error', self.telegramErrorHandler)
bot.on('polling_error', self.telegramErrorHandler);
bot.on('webhook_error', self.telegramErrorHandler);

// wrapper for storing the last sent bot message and deleting the previous one
bot.sendNewMessage = function(cid, text, opt, noDel) {
    let sendr = cid > 0 ? Utils.getUser({ id: cid }) : null;
    if(!noDel && sendr && sendr.last_bot_msg_id) {
        this.deleteMessage(cid, sendr.last_bot_msg_id);
        sendr.last_bot_msg_id = null;
    }
    return this.sendMessage(cid, text, opt).then(msg => {
        if(sendr) sendr.last_bot_msg_id = msg.message_id;
    });
};

// clear or set webHook
if (!self.useWebHook) {
    console.log('clearing WebHook... using data polling');
    bot.setWebHook('');
}
else {
    let setAddr = 'https://' + self.webHookAddr + ':' + self.webHookPort + '/' + self.telegram_bot_token;
    console.log('setting up WebHook: ' + setAddr);
    if (self.webHookCustomCertificate)
        bot.setWebHook(setAddr, self.webCert).then(e => console.log('Webhook result: ' + e));
    else
        bot.setWebHook(setAddr).then(e => console.log('WebHook result: ' + e));
}

// Spam protection wrapper
self.antispam = new AntiSpam(20);

// init file proxy
if(self.useFileProxy) {
    self.fileProxyServer.init(bot, self.fileProxyAddr, self.fileProxyPort);
}

// print stats
//console.log('Stats:' + Utils.getStats(Utils.getLanguageMessages(self.defaultLanguage)));

self.run = false;
self.me; // contains the bot's info object
self.receivedMessages = 0;

console.log('connecting to Telegram bot API...');

// get telegram bot object
bot.getMe()
    .then(res => {
        self.me = res; // assign self telegram bot object
        console.log('Success. Telegram bot info: ' + JSON.stringify(res));
        console.log('Callbacks active.\r\n');

        // listen for messages
        bot.on('message', (msg) => {
            self.handleEx(() => MessageHandler(self, msg))
        });

        // listen for inline Button responses
        bot.on('callback_query', (msg) => {
            if (!self.run) return;
            self.handleEx(() => ReplyHandler(self, msg))
        });
    });