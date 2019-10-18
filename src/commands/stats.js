'use strict';
//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 139,
    available: 3, 
    groupperm: false,
    needslinking: false,
    needsselected: false,
    usage: '/stats',
    description: 'stats',
    command: ['/stats'],
    callback: function (main, ctx) {
        ctx.opt.parse_mode = 'html';
        let s = ctx.isGroup && ctx.groupLinking ?
                ctx.groupMessages : ctx.senderMessages;

        let msg = 'Stats:<code>' + Utils.getStats(s) + '</code>';
        if(!ctx.isGroup)
            ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn('start', s)]];
        ctx.respondChat(msg, ctx.opt);
    }
};