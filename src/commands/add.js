"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

let Utils = require('../class/utils.js').Get();

module.exports = {
    id: 100,
    command: ["/add"],
    available: 1, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: false, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/add', // command usage (including arguments)
    description: 'addServer', // language bundle description
    callback: function (main, ctx) {
        if (!ctx.sender.agreement) {
            ctx.opt.reply_markup.inline_keyboard = [ [ Utils.getCmdBtn('tos', ctx.senderMessages), ] ];
            ctx.respondChat(ctx.senderMessages.noAgreement, ctx.opt);
        }
        else if (ctx.senderInstances.length < 5) {
            ctx.sender.menu = 'add_instance';
            ctx.opt.parse_mode = "html";
            ctx.opt.reply_markup.inline_keyboard = [ [ Utils.getCmdBtn('cancel', ctx.senderMessages), ] ];
            ctx.respondChat(ctx.senderMessages.addInfo, ctx.opt);
        }
        else {
            ctx.opt.reply_markup.inline_keyboard = [ [ Utils.getCmdBtn('menu', ctx.senderMessages), ] ];
            ctx.respondChat(ctx.senderMessages.addLimit, ctx.opt);
        }
    }
};