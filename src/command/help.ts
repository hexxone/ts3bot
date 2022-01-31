"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3Ctx } from "../context";

import Utils from "../class/utils";

export default {
	id: 110,
	available: 3,
	groupperm: false,
	needslinking: false,
	needsselected: false,
	usage: "/help",
	description: "help",
	command: ["/help"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		if (!ctx.isGroup)
			ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("start", ctx.senderMessages)], [Utils.getCmdBtn("faq", ctx.senderMessages), Utils.getCmdBtn("commands", ctx.senderMessages)]];
		ctx.respondChat((ctx.isGroup && ctx.groupLinking !== null ? ctx.groupMessages : ctx.senderMessages).helpText, ctx.opt);
	},
};
