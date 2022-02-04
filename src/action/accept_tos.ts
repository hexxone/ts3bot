"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3BotCtx, MessageCtx } from "../context";

export default {
	id: 1,
	action: ["accept_tos"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		ctx.sender.menu = "";
		const msgs = ctx.senderMessages;
		if (ctx.text == msgs.tosString) {
			ctx.sender.agreement = true;
			ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("addServer", msgs)]];
			ctx.respondChat(msgs.tosAccept, ctx.opt);
		} else ctx.respondChat(msgs.tosReject, ctx.opt);
	},
};
