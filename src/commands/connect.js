"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 104,
    available: 3, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: true, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: true, // the command requires the group to have a linked instance (available 2|3)
    needsselected: true, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/connect', // command usage (including arguments)
    description: 'connect', // language bundle description
    command: ["/connect"],
    callback: function (main, ctx) {
        if (ctx.isGroup) {
            switch (ctx.groupBinding.instance.connectionState) {
                case 0:
                case 3:
                    ctx.respondChat(ctx.groupMessages.conConnect, ctx.opt);
                    try {
                        ctx.groupBinding.instance.Connect();
                    } catch (e) {
                        ctx.respondChat(ctx.groupMessages.errorPrefix + JSON.stringify(e), ctx.opt);
                    }
                    break;
                case 1:
                    ctx.respondChat(ctx.groupMessages.conConnecting, ctx.opt);
                    break;
                case 2:
                    ctx.respondChat(ctx.groupMessages.conConnected, ctx.opt);
                    break;
            }
        }
        else {
            switch (ctx.senderSelectedInstance.connectionState) {
                case 0:
                case 3:
                    ctx.opt.reply_markup.inline_keyboard = [ [ Utils.getCmdBtn('disconnect', ctx.senderMessages), ] ];
                    ctx.respondChat(ctx.senderMessages.conConnect, ctx.opt);
                    try {
                        ctx.senderSelectedInstance.Connect(false, null, ctx.respondChat);
                    } catch (e) {
                        ctx.opt.reply_markup.inline_keyboard = [ [ Utils.getCmdBtn('disconnect', ctx.senderMessages), ] ];
                        ctx.respondChat(ctx.senderMessages.errorPrefix + JSON.stringify(e), ctx.opt);
                    }
                    break;
                case 1:
                    ctx.respondChat(ctx.senderMessages.conConnecting, ctx.opt);
                    break;
                case 2:
                    ctx.respondChat(ctx.senderMessages.conConnected, ctx.opt);
                    break;
            }
        }
    }
};