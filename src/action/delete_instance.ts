"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3BotCtx, MessageCtx } from "../context";

export default {
	id: 3,
	action: ["delete_instance"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		if (ctx.senderSelectedInstance != null) {
			if (ctx.text == ctx.senderMessages.delConfirmStr + ctx.sender.selected) {
				ctx.sender.menu = "";
				Utils.destroyInstance(ctx.senderSelectedInstance);
				// Deselect
				ctx.sender.selected = "";
				// Success Message
				ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("menu", ctx.senderMessages)]];
				ctx.respondChat(ctx.senderMessages.serverDeleted, ctx.opt);
			} else ctx.respondChat(ctx.senderMessages.deleteError, ctx.opt);
		} else ctx.respondChat(ctx.senderMessages.noInstSelected, ctx.opt);
	},
};
