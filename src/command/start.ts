"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { Chat } from "telegraf/typings/core/types/typegram";

import { MessageCtx, TS3BotCtx } from "../context";

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
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
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
					ctx.respondChat(msgs.groupLinked + ".", ctx.opt).then((msg) => {
						// add menu for user
						ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("menu", msgs)]];
						// TODO confirm '4' is always correct ???
						// wrong: https://t.me/c/-10001417399172/597
						// corr:  https://t.me/c/1417399172/597
						const txt = `: <a href="https://t.me/c/${ctx.msg.chat.id.toString().substring(4)}/${msg?.message_id}">${(ctx.msg.chat as Chat.TitleChat).title}</a>`;
						main.sendNewMessage(inst.instance.id, msgs.groupLinked + txt, ctx.opt);
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
