"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3BotCtx, MessageCtx } from "../context";

export default {
	id: 107,
	available: 3,
	groupperm: true,
	needslinking: true,
	needsselected: true,
	usage: "/disconnect",
	description: "disconnect",
	command: ["/disconnect"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		if (ctx.isGroup) {
			ctx.respondChat(ctx.groupMessages.disconnect, ctx.opt);
			try {
				ctx.groupLinking.instance.Disconnect();
			} catch (e) {
				ctx.respondChat(ctx.groupMessages.errorPrefix + JSON.stringify(e), ctx.opt);
			}
		} else {
			ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("menu", ctx.senderMessages)]];
			ctx.respondChat(ctx.senderMessages.disconnect, ctx.opt);
			try {
				ctx.senderSelectedInstance.Disconnect();
			} catch (e) {
				ctx.respondChat(ctx.senderMessages.errorPrefix + JSON.stringify(e), ctx.opt);
			}
		}
	},
};
