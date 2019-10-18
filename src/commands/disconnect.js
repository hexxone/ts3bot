'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 108,
    available: 3, 
    groupperm: true,
    needslinking: true,
    needsselected: true,
    usage: '/disconnect',
    description: 'disconnect',
    command: ['/disconnect'],
    callback: function (main, ctx) {
        if (ctx.isGroup) {
            ctx.respondChat(ctx.groupMessages.disconnect, ctx.opt);
            try {
                ctx.groupBinding.instance.Disconnect(false, false);
            } catch (e) {
                ctx.respondChat(ctx.groupMessages.errorPrefix + JSON.stringify(e), ctx.opt);
            }
        }
        else {
            ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn('menu', ctx.senderMessages)]];
            ctx.respondChat(ctx.senderMessages.disconnect, ctx.opt);
            try {
                ctx.senderSelectedInstance.Disconnect(false, false);
            } catch (e) {
                ctx.respondChat(ctx.senderMessages.errorPrefix + JSON.stringify(e), ctx.opt);
            }
        }
    }
};