"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 119,
    available: 3, 
    groupperm: true,
    needslinking: true,
    needsselected: false,
    usage: '/pm [on|off]',
    description: 'pm',
    command: ["/pm"],
    callback: function (main, ctx) {
        if (ctx.isGroup) {
            let usage = ctx.groupMessages.usage + this.usage;
            if (ctx.args.length == 2) {
                switch (ctx.args[1].toLowerCase()) {
                    case '0': case 'aus': case 'off': case 'false': case 'disable':
                        ctx.groupBinding.pm = false;
                        ctx.respondChat(ctx.groupMessages.pmDisabled, ctx.opt);
                        break;
                    case '1': case 'an': case 'on': case 'true': case 'enable':
                        ctx.groupBinding.pm = true;
                        ctx.respondChat(ctx.groupMessages.pmEnabled, ctx.opt);
                        break;
                    default:
                        ctx.respondChat(usage, ctx.opt);
                        break;
                }
            }
            else ctx.respondChat(usage, ctx.opt);
        }
        else {
            // TODO add command /pmr, /pmsg, /pmserver, /pmuser
            // TODO change to reply markup
            ctx.opt.reply_markup.keyboard = [ ['send to selected'], ['select server'], ['select user'], ['/cancel'] ];
            let msg = 'TS3 PM:'
            + '\r\nlast server: '
            + '\r\nlast user:   '
            + '\r\nSelect action.';
            ctx.respondChat(msg, ctx.opt);

            // respond:
            // select server & user of last received whisper
            // action send_whisper

            // send selected:
            // action send_whisper
            
            // changeserver:
            // list ts3 servers of groups the user is member of as keyboard

            // changeuser:
            // list possible whisper targets on selected server

            // cancel:
            // leave this menu, leave whisper mode
            
            // put start
            kbarr.push([Utils.getCmdBtn('start', msgs)]);
        }
    }
};