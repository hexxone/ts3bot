"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3BotCtx } from "../context";

import Utils from "../class/utils";

export default {
	id: 101,
	available: 2,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/admin4all [on|off]",
	description: "admin4all",
	command: ["/admin4all"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		const usage = ctx.groupMessages.usage + this.usage;
		if (ctx.args.length == 2) {
			if (Utils.isYes(ctx.args[1])) {
				ctx.groupLinking.alladmin = true;
				ctx.respondChat(ctx.groupMessages.admin4allOn, ctx.opt);
			} else if (Utils.isNo(ctx.args[1])) {
				ctx.groupLinking.alladmin = false;
				ctx.respondChat(ctx.groupMessages.admin4allOff, ctx.opt);
			} else ctx.respondChat(usage, ctx.opt);
		} else ctx.respondChat(usage, ctx.opt);
	},
};
