'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

let Utils = require('../class/utils.js').Get();

module.exports = {
    id: 1,
    action: ['accept_tos'],
    callback: function (main, ctx) {
        ctx.sender.menu = '';
        let msgs = ctx.senderMessages;
        if (ctx.text == msgs.tosString) {
            ctx.sender.agreement = true;
            ctx.opt.reply_markup.inline_keyboard = [ [ Utils.getCmdBtn('addServer', msgs) ] ];
            ctx.respondChat(msgs.tosAccept, ctx.opt);
        }
        else ctx.respondChat(msgs.tosReject, ctx.opt);
    }
};