'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

let Utils = require('../class/utils.js').Get();

module.exports = {
    id: 138,
    hidden: true,
    available: 3,
    groupperm: false,
    needslinking: false,
    needsselected: false,
    usage: '/start',
    description: 'start',
    command: ['/start'],
    callback: function (main, ctx) {
        ctx.opt.disable_web_page_preview = true;
        let msgs = ctx.senderMessages;
        if (ctx.isGroup) {
            if (ctx.groupBinding !== null)
                msgs = ctx.groupMessages;

            if (ctx.args.length === 2) {
                if (ctx.groupBinding !== null)
                    ctx.respondChat(msgs.groupAlreadyLinked, ctx.opt);
                else if (main.deeplinking.has(ctx.args[1])) {
                    // get linking object & remove from hash-map
                    let inst = main.deeplinking.get(ctx.args[1]);
                    main.deeplinking.delete(ctx.args[1]);
                    // set groupid and add to linkings
                    inst.Link(ctx.chatId);
                    main.linkings.push(inst);
                    // Notify
                    let lnked = msgs.groupLinked;
                    ctx.respondChat(lnked + '.', ctx.opt);
                    main.bot.sendNewMessage(inst.instance.id, lnked + ': ' + ctx.msg.chat.title, { reply_markup: { inline_keyboard: [[Utils.getCmdBtn('menu', msgs)]] } });
                }
                else ctx.respondChat(msgs.invalidLink, ctx.opt);
            }
            else ctx.respondChat(
                (ctx.groupBinding === null ? msgs.groupNotLinked : msgs.groupAlreadyLinked),
                ctx.opt);
        }
        else {
            ctx.opt.reply_markup.inline_keyboard = [
                [Utils.getCmdBtn('menu', msgs), Utils.getCmdBtn('stats', msgs)],
                [Utils.getCmdBtn('lang', msgs), Utils.getCmdBtn('help', msgs)]
            ];
            ctx.respondChat(msgs.startChat, ctx.opt);
        }
    }
};