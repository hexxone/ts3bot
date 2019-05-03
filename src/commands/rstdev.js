"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 121,
    available: 0, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: false, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/rstdev [id]', // command usage (including arguments)
    description: 'rstdev', // language bundle description
    command: ["/rstdev"],
    callback: function (main, ctx) {
        if (ctx.sender.id == ctx.developer_id) {
            if (ctx.args.length == 2) {
                let resetusr = Utils.getUser({ id: ctx.args[1] });
                if (resetusr) {
                    resetusr.sentdev = false;
                    ctx.respondChat('User was reset.', ctx.opt);
                }
                else ctx.respondChat('User doesnt seem to exist.', ctx.opt);
            }
            else ctx.respondChat('Argument error.', ctx.opt);
        }
    }
};