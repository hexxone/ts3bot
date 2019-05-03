"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 112,
    available: 3, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: true, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: true, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/lang', // command usage (including arguments)
    description: 'lang', // language bundle description
    command: ["/lang"],
    callback: function (main, ctx) {
        let kb = [];
        let msg = ctx.isGroup ? ctx.groupMessages.langCurrent : ctx.senderMessages.langCurrent;
        if(!ctx.isGroup) {
            kb.push([Utils.getCmdBtn('start', ctx.senderMessages)]);
            ctx.opt.reply_markup.inline_keyboard = kb;
        }
        if (ctx.args.length == 2) {
            let trylang = ctx.args[1];
            for (let lang of main.languages) {
                if (lang.langCode == trylang || lang.langName == trylang || lang.langFlag == trylang) {
                    // set language
                    if (ctx.isGroup) ctx.groupBinding.language = lang.langCode;
                    else ctx.sender.language = lang.langCode;
                    // set response text
                    let local = Utils.getLanguageMessages(lang.langCode);
                    ctx.respondChat(local.langText, ctx.opt);
                    return;
                }
            }
            msg = ctx.senderMessages.langNotFound;
        }
        if(ctx.isGroup) {
            kb.push(["/menu"]);
            msg = "<a href='tg://user?id=" + ctx.sender.id + "'>@</a> " + msg;
            ctx.opt.reply_markup.keyboard = kb;
            ctx.opt.parse_mode = "html";
        }
        for(let lng of main.languages) {
            if(lng.langCode == ctx.sender.language)
                continue;
            if(ctx.isGroup)
                kb.push(["/lang " + lng.langFlag]);
            else
                kb.push([{
                    text: lng.langFlag,
                    callback_data: 'l'+lng.langFlag
                }]);
        }
        ctx.respondChat(msg, ctx.opt);
    }
};