'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('./utils.js').Get();

const myClass = {
    // prepares ctx strings from message
    prepare: function (ctx, msg) {
        ctx.cmd = '';
        ctx.args = msg.text.includes(' ') ? msg.text.split(' ') : [msg.text];
        // Check if the text starts as command and set it
        if (msg.text.startsWith('/')) {
            // if args, set first - else set text
            ctx.cmd = (ctx.args.length > 1) ? ctx.args[0] : msg.text;
            // Check if the command contains a bot target
            // and set command without the bot name
            if (ctx.cmd.includes('@'))
                ctx.args[0] = ctx.cmd = ctx.cmd.split('@')[0];
        }
        return ctx;
    },
    // handles cancel
    cancel: function (ctx) {
        ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn('menu', ctx.senderMessages)]];
        if (ctx.sender.menu !== '') {
            let tmenu = ctx.sender.menu;
            ctx.sender.menu = '';
            ctx.respondChat(ctx.senderMessages.actionCancel + tmenu, ctx.opt);
            return true;
        }
        else ctx.respondChat(ctx.senderMessages.actionNoCancel, ctx.opt);
        return false;
    },
    // handles bot command
    handle: function (self, ctx, mode, value) {
        return !self.commands.reduce(function (cont, obj) {
            // ID recognized?
            if (!cont) return false;
            if (mode == 1 && obj.id != value) return true;
            let msgs = ctx.senderMessages;
            // loop possible alts
            return obj.command.reduce(function (cont2, command) {
                // command recognized?
                if (!cont2) return false;
                if (mode == 0 && command.toLowerCase() !== value.toLowerCase()) return true;
                let exec = false;
                if (ctx.isGroup) { // sent in group?
                    if (ctx.groupBinding) msgs = ctx.groupMessages;
                    if (obj.available > 1) { // command is available in group?
                        // does the group need a linked server?
                        if (obj.needslinking && !(exec = (ctx.groupBinding) ? true : false))
                            self.bot.sendNewMessage(ctx.chatId, msgs.commandNotLinked, ctx.opt);

                        // does the command require admin permissions?
                        if (obj.groupperm && !(exec = (!ctx.groupBinding || ctx.groupBinding.instance.id == ctx.sender.id || ctx.groupBinding.alladmin)))
                            self.bot.sendNewMessage(ctx.chatId, msgs.commandForbidden, ctx.opt);

                        // if nothing was required, we can execute.
                        exec = exec || (!obj.groupperm && !obj.needslinking);
                    }
                    else if (obj.available !== 0) // > dev commands 'do not exist' => dont respond
                        self.bot.sendNewMessage(ctx.chatId, msgs.commandErrChat1, ctx.opt);
                }
                else {
                    // is admin command and sender is admin?
                    if (obj.available === 0 && ctx.sender.id == self.developer_id) exec = true;
                    // is group command ?
                    else if (obj.available === 2)
                        self.bot.sendNewMessage(ctx.chatId, msgs.commandErrChat2, ctx.opt);
                    else {
                        if (obj.needsselected) {
                            if (!(exec = (ctx.senderSelectedInstance) ? true : false)) {
                                if (ctx.senderInstances.length > 0)
                                    self.bot.sendNewMessage(ctx.chatId, ctx.senderMessages.commandNoSelect, ctx.opt);
                                else
                                    self.bot.sendNewMessage(ctx.chatId, ctx.sender.agreement ? msgs.commandNoAdded : msgs.commandNoTOS, ctx.opt);
                            }
                        }
                        else exec = true;
                    }
                }
                // only execute if conditions were met.
                if (exec) {
                    console.log('COMMAND: ' + command + ' by: ' + ctx.sender.id);
                    if (!ctx.isGroup && !ctx.isReply) self.bot.deleteMessage(ctx.chatId, ctx.msg.message_id);
                    obj.callback(self, ctx);
                }
                return !exec;
            }, true);
        }, true);
    }
};

module.exports = myClass;
