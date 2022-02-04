"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3BotCtx } from "../context";

import Utils from "../class/utils";

export default {
	id: 118,
	available: 2,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/notifyjoin [on|off]",
	description: "notifyjoin",
	command: ["/notifyjoin"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		if (ctx.groupLinking.instance.id == ctx.sender.id || ctx.groupLinking.alladmin) {
			const usage = ctx.groupMessages.usage + this.usage;
			if (ctx.args.length == 2) {
				let opt = "";
				if (Utils.isYes(ctx.args[1])) {
					ctx.groupLinking.notifyjoin = true;
					opt = ctx.groupMessages.optionOn;
				} else if (Utils.isNo(ctx.args[1])) {
					ctx.groupLinking.notifyjoin = false;
					opt = ctx.groupMessages.optionOff;
				} else {
					ctx.respondChat(usage, ctx.opt);
					return;
				}
				ctx.respondChat(ctx.groupMessages.setJoinNotifications + opt, ctx.opt);
			} else ctx.respondChat(usage, ctx.opt);
		} else ctx.respondChat(ctx.senderMessages.notAllowed, ctx.opt);
	},
};
