"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 118,
    available: 2, 
    groupperm: true,
    needslinking: true,
    needsselected: false,
    usage: '/notifymove [global|channel|off]',
    description: 'notifymove',
    command: ["/notifymove"],
    callback: function (main, ctx) {
        let usage = 'Use: /notifymove [global|channel|false]';
        let msgs = ctx.senderMessages;
        if (ctx.isGroup) {
            if (ctx.groupBinding !== null) {
                if (ctx.groupBinding.instance.id == ctx.sender.id || ctx.groupBinding.alladmin) {
                    if (ctx.args.length == 2) {
                        switch (ctx.args[1].toLowerCase()) {
                            case 'false': case 'aus': case '0': case 'off': case 'meh': case 'lame': 
                                ctx.groupBinding.notifymove = 0;
                                break;
                            case 'channel': case '1':
                                ctx.groupBinding.notifymove = 1;
                                break;
                            case 'global': case '2':
                                ctx.groupBinding.notifymove = 2;
                                break;
                            default:
                                ctx.respondChat(usage, ctx.opt);
                                return;
                        }
                        let msg = ctx.groupMessages.setMoveNotifications + Utils.nmToStr(ctx.groupBinding.language, ctx.groupBinding.notifymove);
                        ctx.respondChat(msg, ctx.opt);
                    }
                    else ctx.respondChat(usage, ctx.opt);
                }
                else ctx.respondChat(msgs.notAllowed, ctx.opt);
            }
            else ctx.respondChat(msgs.notLinked, ctx.opt);
        }
        else ctx.respondChat(msgs.useInGroup, ctx.opt);
    }
};