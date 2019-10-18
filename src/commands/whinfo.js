"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

module.exports = {
    id: 144,
    available: 0, 
    groupperm: false,
    needslinking: false,
    needsselected: false,
    usage: '/whinfo',
    description: 'whinfo',
    command: ["/whinfo"],
    callback: function (main, ctx) {
        if (ctx.sender.id == ctx.developer_id) {
            let whi = main.bot._request('getWebhookInfo');
            //console.log(whi);
            ctx.respondChat('Here is the WebHook info:\r\n\r\n' + JSON.stringify(whi), ctx.opt);
        }
    }
};