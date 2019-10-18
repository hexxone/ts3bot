'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 119,
    available: 2,
    groupperm: true,
    needslinking: true,
    needsselected: false,
    usage: '/notifyjoin [on|off]',
    description: 'notifyjoin',
    command: ['/notifyjoin'],
    callback: function (main, ctx) {
        if (ctx.groupBinding.instance.id == ctx.sender.id || ctx.groupBinding.alladmin) {
            let usage = ctx.groupMessages.usage + this.usage;
            if (ctx.args.length == 2) {
                let opt = '';
                if (Utils.isYes(ctx.args[1])) {
                    ctx.groupBinding.notifyjoin = true;
                    opt = ctx.groupMessages.optionOn;
                }
                else if (Utils.isNo(ctx.args[1])) {
                    ctx.groupBinding.notifyjoin = false;
                    opt = ctx.groupMessages.optionOff;
                }
                else {
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