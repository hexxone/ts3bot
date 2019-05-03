"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 135,
    available: 2, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: true, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: true, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/spamcheck [on|off]', // command usage (including arguments)
    description: 'spamcheck', // language bundle description
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