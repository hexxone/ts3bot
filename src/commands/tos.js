"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

module.exports = {
    id: 139,
    available: 1, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: false, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/tos', // command usage (including arguments)
    description: 'tos', // language bundle description
    command: ["/tos"],
    callback: function (main, ctx) {
    	let agree = '\r\n\r\n' + ctx.senderMessages.tosAgree.replace("<tos_string>", ctx.senderMessages.tosString);
    	
        ctx.respondChat(ctx.senderMessages.tosText +
        	(ctx.sender.agreement ? '' : agree ), ctx.opt);
        	
        if (!ctx.sender.agreement)
            ctx.sender.menu = "accept_tos";
    }
};