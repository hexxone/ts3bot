'use strict';

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

module.exports = {
    id: 101,
    available: 2, 
    groupperm: true,
    needslinking: true,
    needsselected: false,
    usage: '/admin4all [on|off]',
    description: 'admin4all',
    command: ['/admin4all'],
    callback: function (main, ctx) {
    	let usage = ctx.groupMessages.usage + this.usage;
        if (ctx.args.length == 2) {
            switch (ctx.args[1].toLowerCase()) {
                case '1': case 'an': case 'on': case 'true': case 'enable': case 'amk': case 'fly':
                    ctx.groupBinding.alladmin = true;
                    ctx.respondChat(ctx.groupMessages.admin4allOn, ctx.opt);
                    break;
                case '0': case 'aus': case 'off': case 'false': case 'disable': case 'meh': case 'lame':
                    ctx.groupBinding.alladmin = false;
                    ctx.respondChat(ctx.groupMessages.admin4allOff, ctx.opt);
                    break;
                default:
                    ctx.respondChat(usage, ctx.opt);
                    break;
            }
        }
        else ctx.respondChat(usage, ctx.opt);
    }
};