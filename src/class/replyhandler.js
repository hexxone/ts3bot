'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('./utils.js').Get();
const CommandHandler = require('./commandhandler.js');

// Telegram message-receive-handler

module.exports = function (self, cq) {
    // debug print
    // console.log('callback_query: ' + JSON.stringify(cq));
    let msg = cq.message;
    if (!msg || !cq.data || !cq.from) return;
    self.receivedMessages++;
    let sender = Utils.getUser(cq.from);
    // ctx to work with
    let ctx = {
        isReply: true,
        respondChat: (txt, opt) => {
            opt.chat_id = msg.chat.id;
            opt.message_id = msg.message_id;
            return self.bot.editMessageText(txt, opt);
        },
        developer_id: self.developer_id,
        msg: msg,
        args: [],
        text: msg.text,
        chatId: msg.chat.id,
        sender: sender,
        opt: {
            reply_markup: {
                inline_keyboard: []
            }
        },
        isGroup: msg.chat.type !== 'private',
    };
    // gather some objects
    ctx.senderInstances = Utils.getUserInstances(sender.id);
    ctx.senderSelectedInstance = (sender.selected !== '') ? Utils.getArrayObjectByName(ctx.senderInstances, sender.selected) : null;
    ctx.senderLinkings = Utils.getUserLinkings(sender.id);
    ctx.senderMessages = Utils.getLanguageMessages(sender.language);
    // process group ctx
    groupcheck: if (ctx.isGroup) {
        // Set/Update the current group name
        self.groupnames.set(ctx.chatId, msg.chat.title);
        // get the group Binding (if exists)
        ctx.groupBinding = Utils.getGroupLinking(ctx.chatId);
        if (!ctx.groupBinding) break groupcheck; // no linked server = abort
        // add user
        ctx.groupBinding.CheckAddUser(sender);
        // get messages for group language
        ctx.groupMessages = Utils.getLanguageMessages(ctx.groupBinding.language);
    }
    // process query
    if (cq.data) {
        // execute command
        if (cq.data.startsWith('c')) {
            let cid = cq.data.substring(1);
            // cancel command
            if (!ctx.isGroup && cid == 'c')
                CommandHandler.cancel(ctx);
            else {
                // Callback Commands with text args are not possible = no need to prep ctx.
                let exec = CommandHandler.handle(self, ctx, 1, cid);
                if (!exec) {
                    self.bot.answerCallbackQuery(cq.id, { text: ctx.senderMessages.replyError });
                    return false;
                }
            }
        }
        // special case set language, doesnt need any checks
        if (cq.data.startsWith('l')) {
            // prepare fake ctx
            let flag = cq.data.substring(1);
            ctx = CommandHandler.prepare(ctx, { text: '/lang ' + flag });
            // call lang command
            let cmdo = Utils.getCmdByDesc('lang');
            cmdo.callback(self, ctx);
        }
        // execute action
    }

    self.bot.answerCallbackQuery(cq.id, {});
    return true;
}