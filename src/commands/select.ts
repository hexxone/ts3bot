"use strict";

//
// Copyright (c) 2019 D.Thiele All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

module.exports = {
	id: 125,
	hidden: false,
	available: 1,
	groupperm: false,
	needslinking: false,
	needsselected: false,
	usage: "/select",
	description: "select",
	command: ["/select"],
	callback: function (main, ctx) {
		if (ctx.senderInstances.length > 0) {
			ctx.sender.menu = "select";
			let keyboardTop = [["/cancel"]];
			let keyboardArr = [];
			for (let instance of ctx.senderInstances) {
				keyboardArr.push(instance.name);
				if (keyboardArr.length > 1) {
					keyboardTop.push(keyboardArr.slice(0));
					keyboardArr = [];
				}
			}
			if (keyboardArr.length > 0) keyboardTop.push(keyboardArr.slice(0));
			ctx.opt.reply_markup.keyboard = keyboardTop;
			ctx.opt.reply_markup.resize_keyboard = true;
			ctx.opt.reply_markup.one_time_keyboard = true;
			main.bot.sendNewMessage(
				ctx.chatId,
				ctx.senderMessages.selectServer,
				ctx.opt
			);
		} else
			main.bot.sendNewMessage(
				ctx.chatId,
				ctx.senderMessages.commandNoAdded,
				ctx.opt
			);
	},
};
