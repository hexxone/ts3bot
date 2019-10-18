'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 110,
    available: 3, 
    groupperm: false,
    needslinking: false,
    needsselected: false,
    usage: '/help',
    description: 'help',
    command: [ '/help' ],
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