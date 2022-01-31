"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3Ctx, MessageCtx } from "../context";

export default {
	id: 109,
	available: 1,
	groupperm: false,
	needslinking: false,
	needsselected: false,
	usage: "/faq",
	description: "faq",
	command: ["/faq"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		let msgs = ctx.isGroup && ctx.groupBinding !== null ? ctx.groupMessages : ctx.senderMessages;
		let txtt = msgs.faqText;
		txtt = txtt.replace("<sloc>", main.slocCount);
		ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("help", msgs)]];
		ctx.respondChat(txtt, ctx.opt);
	},
};
