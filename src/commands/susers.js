'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

module.exports = {
    id: 140,
    available: 3,
    groupperm: false,
    needslinking: true,
    needsselected: true,
    usage: '/susers',
    description: 'susers',
    command: ['/susers'],
    callback: function (main, ctx) {
        ctx.opt.parse_mode = 'html';
        if (ctx.isGroup) {
            ctx.groupBinding.instance.GetSimpleUserString(
                ctx.groupBinding.language,
                ctx.groupBinding.ignorebots,
                res => {
                    let mymsg = '<code>' + res + '</code>';
                    ctx.respondChat(res, ctx.opt);
                }
            );
        } else {
            ctx.senderSelectedInstance.GetSimpleUserString(
                ctx.sender.language,
                false,
                res => {
                    ctx.respondChat(res, ctx.opt);
                }
            );
        }
    }
};