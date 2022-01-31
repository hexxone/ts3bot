"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3Ctx, MessageCtx } from "../context";

export default {
	id: 102,
	available: 1,
	groupperm: false,
	needslinking: false,
	needsselected: true,
	usage: "/autoconnect [on|off]",
	description: "autoconnect",
	command: ["/autoconnect"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		Utils.fixRemoveKeyboard(main, ctx);
		ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("settings", ctx.senderMessages)]];
		let usage = ctx.senderMessages.usage + this.usage;
		if (ctx.args.length == 2) {
			if (Utils.isYes(ctx.args[1])) {
				ctx.senderSelectedInstance.autoconnect = true;
				ctx.respondChat(ctx.senderMessages.enableAutoConnect, ctx.opt);
			} else if (Utils.isNo(ctx.args[1])) {
				ctx.senderSelectedInstance.autoconnect = false;
				ctx.respondChat(ctx.senderMessages.disableAutoConnect, ctx.opt);
			} else ctx.respondChat(usage, ctx.opt);
		} else ctx.respondChat(usage, ctx.opt);
	},
};
