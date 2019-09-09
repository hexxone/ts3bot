"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 105,
    available: 0, 
    groupperm: false,
    needslinking: false,
    needsselected: false,
    usage: '/debug [on|off]',
    description: 'debug',
    command: ["/debug"],
    callback: function (main, ctx) {
    	let usage = ctx.senderMessages.usage + this.usage;
        if (ctx.args.length == 2) {
            switch (ctx.args[1].toLowerCase()) {
                case '0': case 'aus': case 'off': case 'false': case 'disable':
                    main.debug = false;
                    ctx.respondChat("Debug: false", ctx.opt);
                    break;
                case '1': case 'an': case 'on': case 'true': case 'enable':
                    main.debug = true;
                    ctx.respondChat("Debug: true", ctx.opt);
                    break;
                default:
                    ctx.respondChat(usage, ctx.opt);
                    break;
            }
        }
        else ctx.respondChat(usage, ctx.opt);
    }
};