'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 123,
    available: 0, 
    groupperm: false,
    needslinking: false,
    needsselected: false,
    usage: '/rstdev [id]',
    description: 'rstdev',
    command: ['/rstdev'],
    callback: function (main, ctx) {
        if (ctx.sender.id == ctx.developer_id) {
            if (ctx.args.length == 2) {
                let resetusr = Utils.getUser({ id: ctx.args[1] });
                if (resetusr) {
                    resetusr.sentdev = false;
                    ctx.respondChat('User was reset.', ctx.opt);
                }
                else ctx.respondChat('User doesnt seem to exist.', ctx.opt);
            }
            else ctx.respondChat('Argument error.', ctx.opt);
        }
    }
};