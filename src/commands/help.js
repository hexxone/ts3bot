"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 110,
    available: 3, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: false, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/help', // command usage (including arguments)
    description: 'help', // language bundle description
    command: [ "/help" ],
    callback: function(main, ctx) {
        if(!ctx.isGroup)
            ctx.opt.reply_markup.inline_keyboard = [ 
                [ Utils.getCmdBtn('start', ctx.senderMessages) ],
                [ Utils.getCmdBtn('faq', ctx.senderMessages),
                  Utils.getCmdBtn('commands', ctx.senderMessages) ],
            ];
        ctx.respondChat(((ctx.isGroup && ctx.groupBinding !== null) ?
            ctx.groupMessages : ctx.senderMessages).helpText, ctx.opt);
    }
};