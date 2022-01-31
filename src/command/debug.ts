"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3Ctx, MessageCtx } from "../context";

export default {
	id: 105,
	available: 0,
	groupperm: false,
	needslinking: false,
	needsselected: false,
	usage: "/debug [on|off]",
	description: "debug",
	command: ["/debug"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		let usage = ctx.senderMessages.usage + this.usage;
		if (ctx.args.length == 2) {
			if (Utils.isYes(ctx.args[1])) {
				main.debug = true;
				ctx.respondChat("Debug: true", ctx.opt);
			} else if (Utils.isNo(ctx.args[1])) {
				main.debug = false;
				ctx.respondChat("Debug: false", ctx.opt);
			} else ctx.respondChat(usage, ctx.opt);
		} else ctx.respondChat(usage, ctx.opt);
	},
};
