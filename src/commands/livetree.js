"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

let Utils = require('../class/utils.js').Get();

module.exports = {
    id: 189,
    available: 3,
    groupperm: true,
    needslinking: true,
    needsselected: true,
    usage: '/livetree',
    description: 'livetree',
    command: ["/livetree"],
    callback: function (main, ctx) {
        ctx.opt.parse_mode = "html";
        if (ctx.args.length == 2 && ctx.args[1] == "stop") {
            if (ctx.isGroup)
                ctx.groupBinding.instance.RemoveLiveTree(ctx.chatId);
            else
                ctx.senderSelectedInstance.RemoveLiveTree(ctx.chatId);
        }
        else {
            if (ctx.isGroup)
                ctx.groupBinding.instance.AddLiveTree(ctx.chatId);
            else
                ctx.senderSelectedInstance.AddLiveTree(ctx.chatId);
        }

    }
};