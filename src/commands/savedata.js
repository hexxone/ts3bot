"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Loader = require('../class/loader.js').Get();

module.exports = {
    id: 122,
    available: 0, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: false, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/savedata', // command usage (including arguments)
    description: 'savedata', // language bundle description
    command: ["/savedata"],
    callback: function (main, ctx) {
        if (ctx.sender.id == ctx.developer_id) {
            if (ctx.args.length == 1) {
            	Loader.saveData();
                // Notify
                ctx.respondChat('Data saved.', ctx.opt);
            }
            else ctx.respondChat('Argument error.', ctx.opt);
        }
    }
};