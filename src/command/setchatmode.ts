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
	id: 126,
	hidden: true,
	available: 2,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/channelchat [on|off]",
	description: "channelchat",
	command: ["/channelchat"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		let msgs = ctx.groupMessages;
		let usage = msgs.usage + this.usage;
		if (ctx.args.length == 2) {
			const arg = ctx.args[1].toLowerCase();
			if (Utils.isYes(arg)) ctx.groupLinking.channelchat = true;
			else if (Utils.isNo(arg)) ctx.groupLinking.channelchat = false;
			else {
				ctx.respondChat(usage, ctx.opt);
				return;
			}
			// build message
			let msg = msgs.setChatMode + (ctx.groupLinking.channelchat ? msgs.optionOn : msgs.optionOff);
			ctx.respondChat(msg, ctx.opt);
			ctx.groupLinking.NotifyTS3((ctx.msg.chat as Chat.TitleChat).title, msg);
		} else ctx.respondChat(usage, ctx.opt);
	},
};
