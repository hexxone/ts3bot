"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3BotCtx } from "../context";

import Utils from "../class/utils";

export default {
	id: 131,
	available: 2,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/showgroup [on|off]",
	description: "showgroup",
	command: ["/showgroup"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		const usage = ctx.groupMessages.usage + this.usage;
		if (ctx.args.length == 2) {
			if (Utils.isYes(ctx.args[1])) {
				ctx.groupLinking.showgroupname = true;
				ctx.respondChat(ctx.groupMessages.groupNameShown, ctx.opt);
			} else if (Utils.isNo(ctx.args[1])) {
				ctx.groupLinking.showgroupname = false;
				ctx.respondChat(ctx.groupMessages.groupNameHidden, ctx.opt);
			} else ctx.respondChat(usage, ctx.opt);
		} else ctx.respondChat(usage, ctx.opt);
	},
};
