"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3BotCtx } from "../context";

import Utils from "../class/utils";

export default {
	id: 128,
	hidden: true,
	available: 1,
	groupperm: false,
	needslinking: false,
	needsselected: true,
	usage: "/setchanneldepth [0-5]",
	description: "setchanneldepth",
	command: ["/setchanneldepth"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		Utils.fixRemoveKeyboard(main, ctx);
		let usage = ctx.senderMessages.usage + this.usage;
		if (ctx.args.length == 2 && Utils.isInt(ctx.args[1])) {
			let arg = parseInt(ctx.args[1]);
			if (arg < 0 || arg > 5) ctx.respondChat(usage, ctx.opt);
			else {
				ctx.senderSelectedInstance.channeldepth = arg;
				ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("settings", ctx.senderMessages)]];
				ctx.respondChat(ctx.senderMessages.setChannelDepth + arg, ctx.opt);
			}
		} else ctx.respondChat(usage, ctx.opt);
	},
};
