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
    available: 1, 
    groupperm: false,
    needslinking: false,
    needsselected: false,
    usage: '/add',
    description: 'addServer',
    callback: function (main, ctx) {
        if (!ctx.sender.agreement) {
            ctx.opt.reply_markup.inline_keyboard = [ [ Utils.getCmdBtn('tos', ctx.senderMessages), ] ];
            ctx.respondChat(ctx.senderMessages.noAgreement, ctx.opt);
        }
        else if (ctx.senderInstances.length < 3) {
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