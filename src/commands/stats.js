"use strict";
//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 137,
    available: 3, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: false, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/stats', // command usage (including arguments)
    description: 'stats', // language bundle description
    command: ["/stats"],
    callback: function (main, ctx) {
        ctx.opt.parse_mode = "html";
        let s = ctx.isGroup && ctx.groupLinking ?
                ctx.groupMessages : ctx.senderMessages;

        let msg = 'Stats:<code>' + Utils.getStats(s) + '</code>';
        if(!ctx.isGroup)
            ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn('start', s)]];
        ctx.respondChat(msg, ctx.opt);
    }
};