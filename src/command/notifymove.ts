"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3BotCtx } from "../context";

import Utils from "../class/utils";

export default {
	id: 119,
	available: 2,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/notifymove [global|channel|off]",
	description: "notifymove",
	command: ["/notifymove"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		let usage = "Use: /notifymove [global|channel|false]";
		let msgs = ctx.senderMessages;
		if (ctx.isGroup) {
			if (ctx.groupLinking !== null) {
				if (ctx.groupLinking.instance.id == ctx.sender.id || ctx.groupLinking.alladmin) {
					if (ctx.args.length == 2) {
						switch (ctx.args[1].toLowerCase()) {
							case "false":
							case "aus":
							case "0":
							case "off":
							case "meh":
							case "lame":
								ctx.groupLinking.notifymove = 0;
								break;
							case "channel":
							case "1":
								ctx.groupLinking.notifymove = 1;
								break;
							case "global":
							case "2":
								ctx.groupLinking.notifymove = 2;
								break;
							default:
								ctx.respondChat(usage, ctx.opt);
								return;
						}
						let msg = ctx.groupMessages.setMoveNotifications + Utils.nmToStr(ctx.groupMessages, ctx.groupLinking.notifymove);
						ctx.respondChat(msg, ctx.opt);
					} else ctx.respondChat(usage, ctx.opt);
				} else ctx.respondChat(msgs.notAllowed, ctx.opt);
			} else ctx.respondChat(msgs.notLinked, ctx.opt);
		} else ctx.respondChat(msgs.useInGroup, ctx.opt);
	},
};
