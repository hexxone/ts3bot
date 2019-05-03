"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

module.exports = {
    id: 117,
    available: 2, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: true, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: true, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/notifyjoin [on|off]', // command usage (including arguments)
    description: 'notifyjoin', // language bundle description
    command: ["/notifyjoin"],
    callback: function (main, ctx) {
        if (ctx.groupBinding.instance.id == ctx.sender.id || ctx.groupBinding.alladmin) {
            let usage = ctx.groupMessages.usage + this.usage;
            if (ctx.args.length == 2) {
            	let opt = "";
                switch (ctx.args[1].toLowerCase()) {
                    case '1': case 'an': case 'on': case 'true': case 'enable': case 'amk': case 'fly':
                        ctx.groupBinding.notifyjoin = true;
                        opt = ctx.groupMessages.optionOn;
                        break;
                    case '0': case 'aus': case 'off': case 'false': case 'disable': case 'meh': case 'lame':
                        ctx.groupBinding.notifyjoin = false;
                        opt = ctx.groupMessages.optionOff;
                        break;
                    default:
                        ctx.respondChat(usage, ctx.opt);
                        return;
                }
                ctx.respondChat(ctx.groupMessages.setJoinNotifications + opt, ctx.opt);
            }
            else ctx.respondChat(usage, ctx.opt);
        }
        else ctx.respondChat(ctx.senderMessages.notAllowed, ctx.opt);
    }
};