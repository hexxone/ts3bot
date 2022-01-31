"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3Ctx } from "../context";

import Utils from "../class/utils";

export default {
	id: 113,
	available: 1,
	groupperm: false,
	needslinking: false,
	needsselected: true,
	usage: "/link",
	description: "link",
	command: ["/link"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		if (ctx.senderLinkings.length < 5) {
			ctx.sender.menu = "link_name";
			ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("cancel", ctx.senderMessages)]];
			ctx.respondChat(ctx.senderMessages.addLink, ctx.opt);
		} else ctx.respondChat(ctx.senderMessages.linkLimit, ctx.opt);
	},
};
