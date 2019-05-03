"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

module.exports = {
    id: 107,
    hidden: true,
    available: 1, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: false, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/devmessage', // command usage (including arguments)
    description: 'devmessage', // language bundle description
    command: ["/devmessage"],
    callback: function (main, ctx) {
        if (!ctx.sender.sentdev) {
            ctx.sender.menu = 'dev_message';
            ctx.respondChat(ctx.senderMessages.devSend, ctx.opt);
        }
        else ctx.respondChat(ctx.senderMessages.devWait, ctx.opt);
    }
};