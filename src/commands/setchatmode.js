'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 129,
    hidden: true,
    available: 2, 
    groupperm: true,
    needslinking: true,
    needsselected: false,
    usage: '/setchatmode [global|channel|off]',
    description: 'setchatmode',
    command: ['/setchatmode'],
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