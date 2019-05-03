"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 128,
    hidden: true,
    available: 1, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: false, // the command requires the group to have a linked instance (available 2|3)
    needsselected: true, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/setname', // command usage (including arguments)
    description: 'setname', // language bundle description
    command: ["/setname"],
    callback: function (main, ctx) {
        Utils.fixRemoveKeyboard(main, ctx);
        if (ctx.senderSelectedInstance !== null) {
            ctx.sender.menu = 'set_name';
            ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn('cancel', ctx.senderMessages),]];
            ctx.respondChat(ctx.senderMessages.setBotName, ctx.opt);
        }
        else ctx.respondChat(ctx.senderMessages.noInstSelected, ctx.opt);
    }
};