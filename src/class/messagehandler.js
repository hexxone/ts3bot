'use strict';

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('./utils.js').Get();
const CommandHandler = require('./commandhandler.js');

// Telegram message-receive-handler

module.exports = function (self, msg) {
    self.receivedMessages++;
    let bot = self.bot;
    // user & data ctx for this received message
    // used for any data processing
    let ctx = {
        respondChat: (txt, opt) => {
            return self.bot.sendNewMessage(msg.chat.id, txt, opt);
        },
        developer_id: self.developer_id,
        msg: msg,
        text: msg.text,
        chatId: msg.chat.id,
        sender: Utils.getUser(msg.from),
        opt: {
            reply_markup: {
                keyboard: [],
                resize_keyboard: true,
                one_time_keyboard: true,
            }
        },
        isGroup: msg.chat.type !== 'private',
    };
    // get the sending user's instances
    ctx.senderInstances = Utils.getUserInstances(ctx.sender.id);
    // get the sending user's selected instance
    ctx.senderSelectedInstance = (ctx.sender.selected !== '') ? Utils.getArrayObjectByName(ctx.senderInstances, ctx.sender.selected) : null;
    // Get users instance linkings 
    ctx.senderLinkings = Utils.getUserLinkings(ctx.sender.id);
    // Get user language messages
    ctx.senderMessages = Utils.getLanguageMessages(ctx.sender.language);
    // update last message id for eventual notification
    ctx.sender.last_msg_id = msg.message_id;

    // announcement check
    if(self.run && (!self.announces[ctx.chatId] || self.announces[ctx.chatId] < self.announceID)) {
        self.announces[ctx.chatId] = self.announceID;
        bot.sendMessage(ctx.chatId, self.announceText);
    }

    // If sent from group, try to get the group's binding and send the corresponding messages to it
    groupcheck: if (ctx.isGroup) {
        // Set/Update the current group name
        self.groupnames.set(ctx.chatId, msg.chat.title);
        // reply to messages in groups
        ctx.reply_to_message_id = msg.message_id;
        // get the group Binding (if exists)
        ctx.groupBinding = Utils.getGroupLinking(ctx.chatId);
        if (!ctx.groupBinding) break groupcheck; // no linked server = abort
        // add user
        ctx.groupBinding.CheckAddUser(ctx.sender);
        // get messages for group language
        ctx.groupMessages = Utils.getLanguageMessages(ctx.groupBinding.language);
        // make Telegram user clickable
        let tsname = Utils.tryNameClickable(ctx.sender);

        // someone joined the Telegram group?
        if (msg.new_chat_member) {
            let newuser = Utils.getUser(msg.new_chat_member);
            let nuname = Utils.tryNameClickable(newuser);
            ctx.groupBinding.NotifyTS3(msg.chat.title, nuname + ctx.groupMessages.groupJoin, true);
            ctx.groupBinding.CheckAddUser(newuser);
            return;
        }
        // someone left the Telegram group?
        else if (msg.left_chat_member) {
            // the bot itself was removed from the group?
            if (msg.left_chat_member.id == self.me.id) {
                // destroy binding & do nothing
                Utils.destroyGroupLinking(ctx.groupBinding, true);
                return;
            }
            // remove user from mapping
            let leftuser = Utils.getUser(msg.left_chat_member);
            let luname = Utils.tryNameClickable(leftuser);
            ctx.groupBinding.NotifyTS3(msg.chat.title, luname + ctx.groupMessages.groupLeave, true);
            ctx.groupBinding.RemoveUser(leftuser);
            return;
        }
        // someone sent a message?
        else if (self.run && msg.text && msg.text.substring(0, 1) !== '/') {
            // check for spam
            if (ctx.groupBinding.spamcheck) {
                // Check if user is ignored due to spam
                if (ctx.sender.banneduntil !== null) {
                    if (new Date().getTime() - new Date(ctx.sender.banneduntil).getTime() < 0) return; // still ignoring
                    else {
                        // user is no longer ignored.
                        ctx.sender.banneduntil = null;
                        try {
                            bot.sendNewMessage(ctx.sender.id, ctx.senderMessages.spamEnd.replace('<time>', (ctx.sender.spams + 1) * (ctx.sender.spams + 1) * 5));
                        }
                        catch (err) {
                            bot.sendNewMessage(ctx.chatId, ctx.senderMessages.spamEnd.replace('<time>', (ctx.sender.spams + 1) * (ctx.sender.spams + 1) * 5));
                        }
                    }
                }
                else if (self.antispam.CheckRegisterSpam(ctx.sender)) {
                    // Spam detected
                    try {
                        bot.sendNewMessage(ctx.sender.id, ctx.senderMessages.spamStart1.replace('<time>', (ctx.sender.spams * ctx.sender.spams * 5)));
                    }
                    catch (err) {
                        bot.sendNewMessage(ctx.chatId, ctx.senderMessages.spamStart2.replace('<time>', (ctx.sender.spams * ctx.sender.spams * 5)));
                    }
                    return;
                }
            }
            // send message
            ctx.groupBinding.NotifyTS3(msg.chat.title, tsname + ' : ' + Utils.fixUrlToTS3(msg.text));
        }
        // someone shared a file?
        else if (self.run && self.useFileProxy && ctx.groupBinding.sharemedia) {
            let mft = Utils.getMsgFileType(msg);
            if (mft !== null) {
                let proxiedFileUrl = self.fileProxyServer.getURL(msg, mft);
                console.log('Proxy URL: ' + proxiedFileUrl);
                ctx.groupBinding.NotifyTS3(msg.chat.title, tsname + ' (' + mft + '): ' + Utils.fixUrlToTS3(proxiedFileUrl));
            }
        }
    }

    // Handle text message
    if (msg.text) {
        // Check if the text contains args and split them
        ctx = CommandHandler.prepare(ctx, msg);

        if (msg.from.id == self.developer_id && ctx.cmd.toLocaleLowerCase() == '/runtoggle') {
            self.run = !self.run;
            console.log('runtoggle: ' + self.run);
            return;
        }
        
        if(!self.run) {
            console.log('no run, return.');
            return;
        }

        // '"developer bot shell"' (for unnecessary stuff like calculating something)
        if (msg.from.id == self.developer_id && ctx.cmd.toLocaleLowerCase() == '/xd') {
            let myeval = msg.text.substring(4, msg.text.length);
            console.log('/xd eval: ' + myeval);
            ctx.respondChat(eval(myeval), ctx.opt);
            return;
        }

        // cancel command
        if (!ctx.isGroup && ctx.cmd.toLowerCase() == '/cancel') {
            bot.deleteMessage(msg.chat.id, msg.message_id);
            return CommandHandler.cancel(ctx);
        }

        // check for menu
        if (!ctx.isGroup && ctx.sender.menu !== '') {
            if (ctx.cmd !== '') {
                ctx.opt.reply_markup = {
                    keyboard: [['/cancel']],
                    resize_keyboard: true,
                };
                ctx.respondChat(ctx.senderMessages.actionCommand, ctx.opt);
                return;
            }
            /*
            ** MENU ACTION HANDLER AREA
            */
            return self.actions.reduce(function (cont, obj) {
                if(!cont) return false;
                return obj.action.reduce(function (cont2, action) {
                    if (cont2 && action.toLowerCase() === ctx.sender.menu.toLowerCase()) {
                        console.log('ACTION: ' + action + ' by: ' + msg.from.id);
                        obj.callback(self, ctx);
                        bot.deleteMessage(msg.chat.id, msg.message_id);
                        return false;
                    }
                    return true;
                }, true);
            }, true);
        }

        /*
        ** COMMAND HANDLER AREA
        */
        if(ctx.cmd != '') {
            return CommandHandler.handle(self, ctx, 0, ctx.cmd);
        }
    }
}