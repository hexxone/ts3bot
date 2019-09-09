"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 140,
    available: 3, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: true, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: true, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/unlink (link_name)', // command usage (including arguments)
    description: 'unlink', // language bundle description
    command: ["/unlink"],
    callback: function (main, ctx) {
        let o;
        if (ctx.isGroup) {
            // destroy
            Utils.destroyGroupLinking(ctx.groupBinding);
        }
        else {
            let msgs = ctx.senderMessages;
            if(ctx.args.length != 2 || !Utils.testName(ctx.args[1])) {
                ctx.respondChat(msgs.usage + this.usage, ctx.opt);
                return;
            }
            // Check if Name exists in deeplinkings
            let del = null;
            main.deeplinking.forEach((val, key) => {
                if (val.name == ctx.args[1]) del = key;
            });
            if (del) {
                main.deeplinking.delete(del);
                ctx.sender.menu = '';
                ctx.respondChat(msgs.linkDestroyed.replace('<link>', ctx.args[1]), ctx.opt);
            }
            // Check if Name exists in Bindings
            else if ((o = Utils.getArrayObjectByName(ctx.senderLinkings, ctx.args[1])) !== null) 
                Utils.destroyGroupLinking(o);
            else
                ctx.respondChat(msgs.linkingNotFound, ctx.opt);
        }
    }
};