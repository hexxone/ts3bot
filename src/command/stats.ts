"use strict";
//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3BotCtx } from "../context";

import Utils from "../class/utils";

export default {
	id: 135,
	available: 3,
	groupperm: false,
	needslinking: false,
	needsselected: false,
	usage: "/stats",
	description: "stats",
	command: ["/stats"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		ctx.opt.parse_mode = "HTML";
		const s = ctx.isGroup && ctx.groupLinking ? ctx.groupMessages : ctx.senderMessages;

		const msg = "Stats:<code>" + Utils.getStats(s) + "</code>";
		if (!ctx.isGroup) ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("start", s)]];
		ctx.respondChat(msg, ctx.opt);
	},
};
