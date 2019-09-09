"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 134,
    available: 2, 
    groupperm: true,
    needslinking: true,
    needsselected: false,
    usage: '/silent [on|off]',
    description: 'silent',
    command: ["/silent"],
    callback: function (main, ctx) {
    	let usage = ctx.groupMessages.usage + this.usage;
        let setmsg = ctx.groupMessages.silentMode;
        if (ctx.args.length == 2) {
            switch (ctx.args[1].toLowerCase()) {
                case '1': case 'an': case 'on': case 'true': case 'enable': case 'amk': case 'am_been':
                    ctx.groupBinding.silent = true;
                    ctx.respondChat(setmsg + ctx.groupMessages.optionOn, ctx.opt);
                    break;
                case '0': case 'aus': case 'off': case 'false': case 'disable': case 'meh': case 'xd':
                    ctx.groupBinding.silent = false;
                    ctx.respondChat(setmsg + ctx.groupMessages.optionOff, ctx.opt);
                    break;
                default:
                    ctx.respondChat(usage, ctx.opt);
                    break;
            }
        }
        else ctx.respondChat(usage, ctx.opt);
    }
};