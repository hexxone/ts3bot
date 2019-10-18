'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 134,
    available: 2,
    groupperm: true,
    needslinking: true,
    needsselected: false,
    usage: '/showgroup [on|off]',
    description: 'showgroup',
    command: ['/showgroup'],
    callback: function (main, ctx) {
        let usage = ctx.groupMessages.usage + this.usage;
        if (ctx.args.length == 2) {
            if (Utils.isYes(ctx.args[1])) {
                ctx.groupBinding.showgroupname = true;
                ctx.respondChat(ctx.groupMessages.groupNameShown, ctx.opt);
            }
            else if (Utils.isNo(ctx.args[1])) {
                ctx.groupBinding.showgroupname = false;
                ctx.respondChat(ctx.groupMessages.groupNameHidden, ctx.opt);
            }
            else ctx.respondChat(usage, ctx.opt);
        }
        else ctx.respondChat(usage, ctx.opt);
    }
};