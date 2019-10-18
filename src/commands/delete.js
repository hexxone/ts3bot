'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 106,
    available: 1,
    groupperm: false,
    needslinking: false,
    needsselected: true,
    usage: '/delete',
    description: 'delete',
    command: ['/delete'],
    callback: function (main, ctx) {
        ctx.sender.menu = 'delete_instance';
        ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn('cancel', ctx.senderMessages),]];
        ctx.respondChat(ctx.senderMessages.delConfirm
            + ctx.senderMessages.delConfirmStr
            + ctx.sender.selected, ctx.opt);
    }
};