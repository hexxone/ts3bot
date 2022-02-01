"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { TS3BotCtx, MessageCtx } from "../context";

export default {
	id: 4,
	action: ["dev_message"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		if (ctx.text.length >= 10 && ctx.text.length <= 500) {
			// SEND MESSAGE TO DEV
			main.sendNewMessage(
				main.settings.developer_id,
				"DevMessage\r\nFrom: " + JSON.stringify(ctx.msg.from) + "\r\n\r\nText:\r\n" + ctx.text + '\r\n\r\nDont forget: "/rstdev ' + ctx.sender.id + '"',
				{},
				true
			);
			// then send message to user
			ctx.sender.sentdev = true;
			ctx.sender.menu = "";
			ctx.respondChat(ctx.senderMessages.devSent, ctx.opt);
		} else ctx.respondChat(ctx.senderMessages.devSent + ctx.text.length, ctx.opt);
	},
};
