"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 127,
    hidden: true,
    available: 2, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: true, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: true, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/setchatmode [global|channel|off]', // command usage (including arguments)
    description: 'setchatmode', // language bundle description
    command: ["/setchatmode"],
    callback: function (main, ctx) {
    	let usage = ctx.groupMessages.usage + this.usage;
        if (ctx.args.length == 2) {
            switch (ctx.args[1].toLowerCase()) {
                case '0': case 'aus': case 'off': case 'false': case 'disable':
                    ctx.groupBinding.chatmode = 0;
                    break;
                case '1': case 'channel':
                    ctx.groupBinding.chatmode = 2;
                    break;
                case '2': case 'global':
                    ctx.groupBinding.chatmode = 3;
                    break;
                default:
                    ctx.respondChat(usage, ctx.opt);
                    return;
            }
            // build message
            let msg = ctx.groupMessages.setChatMode
                    + Utils.cmToStr(ctx.groupBinding.language, ctx.groupBinding.chatmode);
            ctx.respondChat(msg, ctx.opt);
            ctx.groupBinding.NotifyTS3(ctx.msg.chat.title, msg);
        }
        else ctx.respondChat(usage, ctx.opt);
    }
};