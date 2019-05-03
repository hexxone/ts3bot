"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 7,
    action: ["set_account", "set_account_first"],
    callback: function (main, ctx) {
        let msgs = ctx.senderMessages;
        if (ctx.senderSelectedInstance != null) {
            if (ctx.args.length == 1 && ctx.args[0].includes('|')) {
                let splits = ctx.args[0].split('|');
                if (splits.length == 2) {
                    ctx.senderSelectedInstance.qname = splits[0];
                    ctx.senderSelectedInstance.qpass = splits[1];
                    // Output / Next
                    let msg = msgs.accountSet;
                    if (Utils.endsWith(ctx.sender.menu, "_first")) {
                        msg += msgs.accBotName;
                        ctx.sender.menu = 'set_name_first';
                        ctx.opt.reply_markup.inline_keyboard = [ [ Utils.getCmdBtn('cancel', msgs) ] ];
                    }
                    else {
                    	ctx.sender.menu = '';
                    	let conSt = ctx.senderSelectedInstance.connectionState;
                    	let kb = [];
                    	if(conSt == 2) kb.push(Utils.getCmdBtn('reconnect', msgs));
                    	else if(conSt != 1) kb.push(Utils.getCmdBtn('connect', msgs));
                        ctx.opt.reply_markup.inline_keyboard = [ [ Utils.getCmdBtn('menu', msgs) ], kb ];
                    }
                    ctx.respondChat(msg, ctx.opt);
                }
                else ctx.respondChat(msgs.invalidFormatAcc, ctx.opt);
            }
            else ctx.respondChat(msgs.invalidFormatAcc, ctx.opt);
        }
        else ctx.respondChat(msgs.noInstSelected, ctx.opt);
    }
};