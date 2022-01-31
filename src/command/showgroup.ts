"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3Ctx } from "../context";

import Utils from "../class/utils";

export default {
	id: 134,
	available: 2,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/showgroup [on|off]",
	description: "showgroup",
	command: ["/showgroup"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		let usage = ctx.groupMessages.usage + this.usage;
		if (ctx.args.length == 2) {
			if (Utils.isYes(ctx.args[1])) {
				ctx.groupBinding.showgroupname = true;
				ctx.respondChat(ctx.groupMessages.groupNameShown, ctx.opt);
			} else if (Utils.isNo(ctx.args[1])) {
				ctx.groupBinding.showgroupname = false;
				ctx.respondChat(ctx.groupMessages.groupNameHidden, ctx.opt);
			} else ctx.respondChat(usage, ctx.opt);
		} else ctx.respondChat(usage, ctx.opt);
	},
};
