'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 9,
    action: ['select'],
    callback: function (main, ctx) {
        if (ctx.args.length == 1 && Utils.testName(ctx.args[0])) {
            let inst = Utils.getArrayObjectByName(ctx.senderInstances, ctx.args[0]);
            if (inst != null) {
                Utils.fixRemoveKeyboard(main, ctx);
                // set new selected vars
                ctx.sender.menu = '';
                ctx.sender.selected = ctx.args[0];
                ctx.senderSelectedInstance = inst;

                // call menu command
                let cmdo = Utils.getCmdByDesc('menu');
                cmdo.callback(main, ctx);
            }
            else ctx.respondChat(ctx.senderMessages.serverNotFound, ctx.opt);
        }
        else ctx.respondChat(ctx.senderMessages.invalidName, ctx.opt);
    }
};