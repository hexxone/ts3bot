'use strict';

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 128,
    hidden: true,
    available: 1, 
    groupperm: false,
    needslinking: false,
    needsselected: true,
    usage: '/setchanneldepth [0-5]',
    description: 'setchanneldepth',
    command: ['/setchanneldepth'],
    callback: function (main, ctx) {
        Utils.fixRemoveKeyboard(main, ctx);
        let usage = ctx.senderMessages.usage + this.usage;
        if (ctx.args.length == 2) {
            let arg = ctx.args[1];
            if (arg < 0 || arg > 5) ctx.respondChat(usage, ctx.opt);
            else {
                ctx.senderSelectedInstance.channeldepth = arg;
                ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn('settings', ctx.senderMessages),]];
                ctx.respondChat(ctx.senderMessages.setChannelDepth + arg, ctx.opt);
            }
        }
        else ctx.respondChat(usage, ctx.opt);
    }
};