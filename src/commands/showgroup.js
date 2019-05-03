"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 132,
    available: 2, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: true, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: true, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/showgroup [on|off]', // command usage (including arguments)
    description: 'showgroup', // language bundle description
    command: ["/showgroup"],
    callback: function (main, ctx) {
    	let usage = ctx.groupMessages.usage + this.usage;
        if (ctx.args.length == 2) {
            switch (ctx.args[1].toLowerCase()) {
                case '0': case 'aus': case 'off': case 'false': case 'disable': case 'disabled':
                    ctx.groupBinding.showgroupname = false;
                    ctx.respondChat(ctx.groupMessages.groupNameHidden, ctx.opt);
                    break;
                case '1': case 'an': case 'on': case 'true': case 'enable': case 'enabled':
                    ctx.groupBinding.showgroupname = true;
                    ctx.respondChat(ctx.groupMessages.groupNameShown, ctx.opt);
                    break;
                default:
                    ctx.respondChat(usage, ctx.opt);
                    break;
            }
        }
        else ctx.respondChat(usage, ctx.opt);
    }
};