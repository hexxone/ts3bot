"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 114,
    available: 1, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: false, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/manage', // command usage (including arguments)
    description: 'manage', // language bundle description
    command: ["/manage"],
    callback: function (main, ctx) {
        Utils.fixRemoveKeyboard(main, ctx);
        let msgs = ctx.senderMessages;
        let msg = msgs.manageHeader;
        let lnks = 0;
        // process user servers
        for (let inst of ctx.senderInstances) {
            // write server name
            msg += '\r\n= ' + inst.name;
            if (ctx.senderSelectedInstance && inst.name == ctx.senderSelectedInstance.name)
                msg += ' ' + msgs.manageSelected;
            // process linked groups
            for (let linking of ctx.senderLinkings) {
                if (linking.instance.name == inst.name) {
                    msg += '\r\n  - [' + linking.name + '] ' + main.groupnames.get(linking.groupid);
                    lnks++;
                }
            }
            // process unlinked groups for server
            main.deeplinking.forEach((val, key) => {
                if (val.instance.id == ctx.sender.id && val.instance.name == inst.name) {
                    msg += '\r\n  - [' + val.name + '] </code><a href=\'https://t.me/' + main.me.username + '?startgroup=' + key + '\'>' + msgs.cmd_link + '</a><code>';
                    lnks++;
                }
            });
            msg += '\r\n';
        }
        msg += '</code>';
        if (lnks > 0)
            msg += '\r\n' + msgs.manageFooter;
        let kbarr = [[Utils.getCmdBtn('addServer', msgs)]];
        // could select other? => add "select"
        if (ctx.senderInstances.length > 1)
            kbarr[0].push(Utils.getCmdBtn('select', msgs));
        // add "link" 
        if (ctx.senderSelectedInstance)
            kbarr.push([Utils.getCmdBtn('link', msgs)]);
        // add "menu"
        kbarr.push([Utils.getCmdBtn('menu', msgs)]);
        ctx.opt.reply_markup.inline_keyboard = kbarr;
        ctx.opt.parse_mode = "html";
        ctx.respondChat(msg, ctx.opt);
    }
};