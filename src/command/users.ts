"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3Ctx } from "../context";

import Utils from "../class/utils";

export default {
	id: 143,
	available: 3,
	groupperm: false,
	needslinking: true,
	needsselected: true,
	usage: "/users",
	description: "users",
	command: ["/users"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		ctx.opt.parse_mode = "HTML";
		let showBots = ctx.args.length == 2 && ctx.args[1] == "-a";
		if (ctx.isGroup) {
			ctx.groupLinking.instance.GetUserString(ctx.groupLinking.language, !showBots && ctx.groupLinking.ignorebots, (res) => ctx.respondChat(res, ctx.opt));
		} else {
			ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("menu", ctx.senderMessages)]];
			ctx.senderSelectedInstance.GetUserString(ctx.sender.language, !showBots, (res) => ctx.respondChat(res, ctx.opt));
		}
	},
};
