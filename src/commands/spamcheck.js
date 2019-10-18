"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

module.exports = {
    id: 137,
    available: 2, 
    groupperm: true,
    needslinking: true,
    needsselected: false,
    usage: '/spamcheck [on|off]',
    description: 'spamcheck',
    command: ["/spamcheck"],
    callback: function (main, ctx) {
    	let usage = ctx.groupMessages.usage + this.usage;
        if (ctx.args.length == 2) {
        	let setmsg = ctx.groupMessages.spamCheck;
            switch (ctx.args[1].toLowerCase()) {
                case '0': case 'aus': case 'off': case 'false': case 'disable':
                    ctx.groupBinding.spamcheck = false;
                    ctx.respondChat(setmsg + ctx.groupMessages.optionOff, ctx.opt);
                    break;
                case '1': case 'an': case 'on': case 'true': case 'enable':
                    ctx.groupBinding.spamcheck = true;
                    ctx.respondChat(setmsg + ctx.groupMessages.optionOn, ctx.opt);
                    break;
                default:
                    ctx.respondChat(usage, ctx.opt);
                    break;
            }
        }
        else ctx.respondChat(usage, ctx.opt);
    }
};