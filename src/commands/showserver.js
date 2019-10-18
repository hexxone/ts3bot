"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

module.exports = {
    id: 135,
    available: 2, 
    groupperm: true,
    needslinking: true,
    needsselected: false,
    usage: '/showserver [on|off]',
    description: 'showserver',
    command: ["/showserver"],
    callback: function (main, ctx) {
    	let usage = ctx.groupMessages.usage + this.usage;
        if (ctx.args.length == 2) {
            switch (ctx.args[1].toLowerCase()) {
                case '0': case 'aus': case 'off': case 'false': case 'disable':
                    ctx.groupBinding.showservername = false;
                    ctx.respondChat(ctx.groupMessages.serverNameHidden, ctx.opt);
                    break;
                case '1': case 'an': case 'on': case 'true': case 'enable':
                    ctx.groupBinding.showservername = true;
                    ctx.respondChat(ctx.groupMessages.serverNameShown, ctx.opt);
                    break;
                default:
                    ctx.respondChat(usage, ctx.opt);
                    break;
            }
        }
        else ctx.respondChat(usage, ctx.opt);
    }
};