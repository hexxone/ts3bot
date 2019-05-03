"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

module.exports = {
    id: 123,
    hidden: true,
    available: 1, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: false, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/select', // command usage (including arguments)
    description: 'select', // language bundle description
    command: ["/select"],
    callback: function (main, ctx) {
        if(ctx.senderInstances.length > 0) {
            ctx.sender.menu = 'select';
            let keyboardTop = [['/cancel']];
            let keyboardArr = [];
            for (let instance of ctx.senderInstances) {
                keyboardArr.push(instance.name);
                if(keyboardArr.length > 1) {
                    keyboardTop.push(keyboardArr.slice(0));
                    keyboardArr = [];
                }
            }
            if(keyboardArr.length > 0) keyboardTop.push(keyboardArr.slice(0));
            ctx.opt.reply_markup.keyboard = keyboardTop;
            ctx.opt.reply_markup.resize_keyboard = true;
            ctx.opt.reply_markup.one_time_keyboard = true;
            main.bot.sendNewMessage(ctx.chatId, ctx.senderMessages.selectServer, ctx.opt);
        }
        else  main.bot.sendNewMessage(ctx.chatId, ctx.senderMessages.commandNoAdded, ctx.opt);
    }
};