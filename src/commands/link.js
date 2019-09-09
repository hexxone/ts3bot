"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 113,
    available: 1, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: false, // the command requires the group to have a linked instance (available 2|3)
    needsselected: true, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/link', // command usage (including arguments)
    description: 'link', // language bundle description
    command: ["/link"],
    callback: function (main, ctx) {
        if(ctx.senderLinkings.length < 5) {
            ctx.sender.menu = 'link_name';
            ctx.opt.reply_markup.inline_keyboard = [ [ Utils.getCmdBtn('cancel', ctx.senderMessages), ] ]; 
            ctx.respondChat(ctx.senderMessages.addLink, ctx.opt);
        }
        else ctx.respondChat(ctx.senderMessages.linkLimit, ctx.opt);
    }
};