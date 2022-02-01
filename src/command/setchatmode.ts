"use strict";

import { Chat } from "telegraf/typings/core/types/typegram";
//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3BotCtx } from "../context";

import Utils from "../class/utils";

export default {
	id: 129,
	hidden: true,
	available: 2,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/setchatmode [global|channel|off]",
	description: "setchatmode",
	command: ["/setchatmode"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		let usage = ctx.groupMessages.usage + this.usage;
		if (ctx.args.length == 2) {
			switch (ctx.args[1].toLowerCase()) {
				case "0":
				case "aus":
				case "off":
				case "false":
				case "disable":
					ctx.groupLinking.chatmode = 0;
					break;
				case "1":
				case "channel":
					ctx.groupLinking.chatmode = 2;
					break;
				case "2":
				case "global":
					ctx.groupLinking.chatmode = 3;
					break;
				default:
					ctx.respondChat(usage, ctx.opt);
					return;
			}
			// build message
			let msg = ctx.groupMessages.setChatMode + Utils.cmToStr(ctx.groupLinking.language, ctx.groupLinking.chatmode);
			ctx.respondChat(msg, ctx.opt);
			ctx.groupLinking.NotifyTS3((ctx.msg.chat as Chat.TitleChat).title, msg);
		} else ctx.respondChat(usage, ctx.opt);
	},
};
