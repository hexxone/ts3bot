'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

module.exports = {
    id: 4,
    action: ['dev_message'],
    callback: function (main, ctx) {
        if (ctx.text.length >= 10 && ctx.text.length <= 500) {
            // SEND MESSAGE TO DEV
            main.bot.sendNewMessage(ctx.developer_id, 'DevMessage\r\nFrom: ' + JSON.stringify(ctx.msg.from) + '\r\n\r\nText:\r\n' + ctx.text + '\r\n\r\nDont forget: "/rstdev ' + ctx.sender.id + '"', true);
            // then send message to user
            ctx.sender.sentdev = true;
            ctx.sender.menu = '';
            ctx.respondChat(ctx.senderMessages.devSent, ctx.opt);
        }
        else ctx.respondChat(ctx.senderMessages.devSent + ctx.text.length, ctx.opt);
    }
};