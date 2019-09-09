"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 129,
    hidden: true,
    available: 1, 
    groupperm: false,
    needslinking: false,
    needsselected: true,
    usage: '/setserver',
    description: 'setserver',
    command: ["/setserver"],
    callback: function (main, ctx) {
        Utils.fixRemoveKeyboard(main, ctx);
        ctx.sender.menu = 'set_server';
        ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn('cancel', ctx.senderMessages),]];
        ctx.respondChat(ctx.senderMessages.setServerAddress, ctx.opt);
    }
};