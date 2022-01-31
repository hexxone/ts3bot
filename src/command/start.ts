"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { Chat } from "telegraf/typings/core/types/typegram";

import { MessageCtx, TS3Ctx } from "../context";

import Utils from "../class/utils";
import { GroupLinking } from "../object/grouplinking";

export default {
	id: 138,
	hidden: true,
	available: 3,
	groupperm: false,
	needslinking: false,
	needsselected: false,
	usage: "/start",
	description: "start",
	command: ["/start"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		let msgs = ctx.senderMessages;
		if (ctx.isGroup) {
			if (ctx.groupLinking !== null) msgs = ctx.groupMessages;

			if (ctx.args.length === 2) {
				if (ctx.groupLinking !== null) ctx.respondChat(msgs.groupAlreadyLinked, ctx.opt);
				else if (main.deeplinking.has(ctx.args[1])) {
					// get linking object & remove from hash-map
					let inst = main.deeplinking.get(ctx.args[1]) as GroupLinking;
					main.deeplinking.delete(ctx.args[1]);
					// set groupid and add to linkings
					inst.Link(ctx.chatId);
					main.linkings.push(inst);
					// Notify
					let lnked = msgs.groupLinked;
					ctx.respondChat(lnked + ".", ctx.opt);
					main.sendNewMessage(inst.instance.id, lnked + ": " + (ctx.msg.chat as Chat.TitleChat).title, {
						reply_markup: {
							inline_keyboard: [[Utils.getCmdBtn("menu", msgs)]],
						},
					});
				} else ctx.respondChat(msgs.invalidLink, ctx.opt);
			} else ctx.respondChat(ctx.groupLinking === null ? msgs.groupNotLinked : msgs.groupAlreadyLinked, ctx.opt);
		} else {
			ctx.opt.reply_markup.inline_keyboard = [
				[Utils.getCmdBtn("menu", msgs), Utils.getCmdBtn("stats", msgs)],
				[Utils.getCmdBtn("lang", msgs), Utils.getCmdBtn("help", msgs)],
			];
			ctx.respondChat(msgs.startChat, ctx.opt);
		}
	},
};