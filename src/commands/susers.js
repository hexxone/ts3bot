"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

module.exports = {
    id: 138,
    available: 3, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: true, // the command requires the group to have a linked instance (available 2|3)
    needsselected: true, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/susers', // command usage (including arguments)
    description: 'susers', // language bundle description
    command: ["/susers"],
    callback: function(main, ctx) {
        ctx.opt.parse_mode = "html";
        if (ctx.isGroup) {
            ctx.groupBinding.instance.GetSimpleUserString(
                ctx.groupBinding.language,
                ctx.groupBinding.ignorebots,
                res => {
                    let mymsg = "<code>" + res + "</code>";
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