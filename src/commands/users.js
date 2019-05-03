"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

let Utils = require('../class/utils.js').Get();

module.exports = {
    id: 141,
    available: 3, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: true, // the command requires the group to have a linked instance (available 2|3)
    needsselected: true, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/users', // command usage (including arguments)
    description: 'users', // language bundle description
    command: ["/users"],
    callback: function(main, ctx) {
        ctx.opt.parse_mode = "html";
        let showBots = (ctx.args.length == 2 && ctx.args[1] == "-a");
        if (ctx.isGroup) {
            ctx.groupBinding.instance.GetUserString(
                ctx.groupBinding.language,
                !showBots && ctx.groupBinding.ignorebots,
                res => ctx.respondChat(res, ctx.opt)
            );
        } else {
            ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn('menu', ctx.senderMessages)]];
            ctx.senderSelectedInstance.GetUserString(
                ctx.sender.language,
                !showBots,
                res => ctx.respondChat(res, ctx.opt)
            );
        }
    }
};