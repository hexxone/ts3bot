'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

module.exports = {
    id: 122,
    available: 3,
    groupperm: true,
    needslinking: true,
    needsselected: true,
    usage: '/reconnect',
    description: 'reconnect',
    command: ['/reconnect'],
    callback: function (main, ctx) {
        let msgs = ctx.senderMessages;
        if (ctx.isGroup) {
            if (ctx.groupBinding !== null) {
                if (ctx.groupBinding.instance.id == ctx.sender.id || ctx.groupBinding.alladmin) {
                    if (ctx.groupBinding.instance.connectionState == 2) {
                        ctx.respondChat(ctx.groupMessages.serverReconnecting, ctx.opt);
                        try {
                            ctx.groupBinding.instance.Disconnect(true);
                        } catch (e) {
                            ctx.respondChat(msgs.errorPrefix + JSON.stringify(e), ctx.opt);
                        }
                    }
                }
                else ctx.respondChat(msgs.notAllowed, ctx.opt);
            }
            else ctx.respondChat(msgs.notLinked, ctx.opt);
        }
        else {
            if (ctx.senderSelectedInstance !== null) {
                if (ctx.senderSelectedInstance.connectionState == 2) {
                    ctx.respondChat(ctx.senderMessages.serverReconnecting, ctx.opt);
                    try {
                        ctx.senderSelectedInstance.Disconnect(true);
                    } catch (e) {
                        ctx.respondChat(msgs.errorPrefix + JSON.stringify(e), ctx.opt);
                    }
                }
            }
            else ctx.respondChat(msgs.noInstSelected, ctx.opt);
        }
    }
};