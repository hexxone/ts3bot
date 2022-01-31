"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { CallbackQuery, Message, Chat } from "typegram";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

import { MessageCtx, TS3Ctx } from "../context";

import Utils from "../class/utils";
import CommandHandler from "./commandhandler";

// Telegram message-receive-handler

export default function (self: TS3Ctx) {
	let bot = self.bot;

	bot.on("callback_query", (cqCtx) => {
		if (!self.run) return;

		const cq = cqCtx.callbackQuery as CallbackQuery.DataCallbackQuery;

		// debug print
		// console.log('callback_query: ' + JSON.stringify(cq));
		let msg = cq.message as Message.TextMessage;
		if (msg === undefined || cq.data === undefined || cqCtx.from === undefined) return;

		self.receivedMessages++;

		// gather some objects
		const sender = Utils.getUser(cqCtx.from);
		const senderInstances = Utils.getUserInstances(sender.id);
		const senderSelectedInstance = sender.selected !== "" ? Utils.getArrayObjectByName(senderInstances, sender.selected) : null;
		const senderLinkings = Utils.getUserLinkings(sender.id);
		const senderMessages = Utils.getLanguageMessages(sender.language);

		// ctx to work with
		let ctx = {
			isReply: true,
			respondChat: (txt: string, opt: ExtraReplyMessage, noDel: boolean) => {
				self.bot.telegram.editMessageText(msg.chat.id, msg.message_id, undefined, txt, opt as any);
			},
			developer_id: self.developer_id,
			msg: msg,
			text: msg.text,
			chatId: msg.chat.id,
			sender,
			senderInstances,
			senderSelectedInstance,
			senderLinkings,
			senderMessages,
			opt: {
				reply_markup: {
					inline_keyboard: [],
				},
				disable_web_page_preview: true,
			},
			isGroup: msg.chat.type !== "private",
		} as MessageCtx;

		// process group ctx?
		groupcheck: if (ctx.isGroup) {
			// Set/Update the current group name
			self.groupnames.set(ctx.chatId, (msg.chat as Chat.TitleChat).title);
			// get the group Binding (if exists)
			ctx.groupLinking = Utils.getGroupLinking(ctx.chatId);
			if (!ctx.groupLinking) break groupcheck; // no linked server = abort
			// add user
			ctx.groupLinking.CheckAddUser(sender);
			// get messages for group language
			ctx.groupMessages = Utils.getLanguageMessages(ctx.groupLinking.language);
		}

		// process query
		if (cq.data) {
			// execute command
			if (cq.data.startsWith("c")) {
				let cid = cq.data.substring(1);
				// cancel command
				if (!ctx.isGroup && cid == "c") CommandHandler.cancel(ctx);
				else {
					// Callback Commands with text args are not possible = no need to prep ctx.
					let exec = CommandHandler.handle(self, ctx, 1, cid);
					if (!exec) {
						cqCtx.answerCbQuery(ctx.senderMessages.replyError);
						return;
					}
				}
			}
			// special case set language, doesnt need any checks
			if (cq.data.startsWith("l")) {
				// prepare fake ctx
				let flag = cq.data.substring(1);
				CommandHandler.prepare(ctx, "/lang " + flag);
				// call lang command
				let cmdo = Utils.getCmdByDesc("lang");
				if (cmdo) cmdo.callback(self, ctx);
			}
			// execute action
		}

		cqCtx.answerCbQuery();
	});
}
