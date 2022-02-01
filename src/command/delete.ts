"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3BotCtx, MessageCtx } from "../context";

export default {
	id: 106,
	available: 1,
	groupperm: false,
	needslinking: false,
	needsselected: true,
	usage: "/delete",
	description: "delete",
	command: ["/delete"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		ctx.sender.menu = "delete_instance";
		ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("cancel", ctx.senderMessages)]];
		ctx.respondChat(ctx.senderMessages.delConfirm + ctx.senderMessages.delConfirmStr + ctx.sender.selected, ctx.opt);
	},
};
