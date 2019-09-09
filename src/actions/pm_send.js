"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 6,
    action: ["select"],
    callback: function (main, ctx) {
        Utils.fixRemoveKeyboard(main, ctx);
        ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn('menu', ctx.senderMessages),]];
        if (ctx.args.length == 1 && Utils.testName(ctx.args[0])) {
            let inst = Utils.getArrayObjectByName(ctx.senderInstances, ctx.args[0]);
            if (inst != null) {
                // TODO set instance & call menu command?
                ctx.sender.selected = ctx.args[0];
                ctx.sender.menu = '';
                ctx.opt.parse_mode = "html";
                let msg = ctx.senderMessages.serverSelected + '<code>' + ctx.args[0] + '</code>';
                ctx.respondChat(msg, ctx.opt);
            }
            else ctx.respondChat(ctx.senderMessages.serverNotFound, ctx.opt);
        }
        else ctx.respondChat(ctx.senderMessages.invalidName, ctx.opt);
    }
};