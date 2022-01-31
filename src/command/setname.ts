"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3Ctx } from "../context";

import Utils from "../class/utils";

export default {
	id: 130,
	hidden: true,
	available: 1,
	groupperm: false,
	needslinking: false,
	needsselected: true,
	usage: "/setname",
	description: "setname",
	command: ["/setname"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		Utils.fixRemoveKeyboard(main, ctx);
		if (ctx.senderSelectedInstance !== null) {
			ctx.sender.menu = "set_name";
			ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("cancel", ctx.senderMessages)]];
			ctx.respondChat(ctx.senderMessages.setBotName, ctx.opt);
		} else ctx.respondChat(ctx.senderMessages.noInstSelected, ctx.opt);
	},
};
