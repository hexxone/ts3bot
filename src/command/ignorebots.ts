"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3Ctx } from "../context";

import Utils from "../class/utils";

export default {
	id: 111,
	available: 2,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/ignorebots [on|off]",
	description: "ignorebots",
	command: ["/ignorebots"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		let usage = ctx.groupMessages.usage + this.usage;
		if (ctx.args.length == 2) {
			if (Utils.isYes(ctx.args[1])) {
				ctx.groupBinding.ignorebots = true;
				ctx.respondChat(ctx.groupMessages.ignorebots, ctx.opt);
			} else if (Utils.isNo(ctx.args[1])) {
				ctx.groupBinding.ignorebots = false;
				ctx.respondChat(ctx.groupMessages.unignorebots, ctx.opt);
			} else ctx.respondChat(usage, ctx.opt);
		} else ctx.respondChat(usage, ctx.opt);
	},
};
