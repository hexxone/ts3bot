'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('../class/utils.js').Get();
const GroupLinking = require('../class/grouplinking.js');

module.exports = {
    id: 5,
    action: ['link_name'],
    callback: function (main, ctx) {
        //ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn('manage', ctx.senderMessages),]];
        if (ctx.senderSelectedInstance !== null) {
            // Check if Correct Format
            if (ctx.args.length == 1 && Utils.testName(ctx.args[0])) {
                // Check if Name exists in deeplinkings
                let hasUnlinked = false;
                main.deeplinking.forEach(function (val, key) {
                    if (val.instance.id == ctx.sender.id && val.name === ctx.args[0])
                        hasUnlinked = true;
                });
                // Check if Name exists in Bindings
                if (!hasUnlinked && Utils.getArrayObjectByName(ctx.senderLinkings, ctx.args[0]) === null) {
                    let hash = Utils.randomString(16);
                    main.deeplinking.set(hash, new GroupLinking(ctx.args[0], ctx.senderSelectedInstance));
                    let link = 'https://t.me/' + main.me.username + '?startgroup=' + hash;
                    ctx.sender.menu = '';
                    ctx.opt.disable_web_page_preview = true;
                    ctx.respondChat(ctx.senderMessages.linkGroup + '\r\n' + link, ctx.opt, true);
                }
                else ctx.respondChat(ctx.senderMessages.nameInUse, ctx.opt);
            }
            else ctx.respondChat(ctx.senderMessages.nameError, ctx.opt);
        }
        else ctx.respondChat(ctx.senderMessages.noInstSelected, ctx.opt);
    }
};