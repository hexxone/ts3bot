"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { Chat } from "typegram";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

import { MessageCtx, TS3Ctx } from "../context";

import Utils from "../class/utils";
import CommandHandler from "./commandhandler";

const REPLY_IN_GROUPS = false;

// Telegram message-receive-handler

export default function (self: TS3Ctx) {
	self.receivedMessages++;
	let bot = self.bot;

	// Some TG user joined a group
	bot.on("new_chat_members", (tgCtx) => {
		if (tgCtx.message.chat.type == "private") return;
		// group connection
		let groupBinding = Utils.getGroupLinking(tgCtx.message.chat.id);
		if (groupBinding == null) return;
		// group messages
		let groupMessages = Utils.getLanguageMessages(groupBinding.language);
		for (var usr of tgCtx.message.new_chat_members) {
			// add all new users
			let newuser = Utils.getUser(usr);
			let nuname = Utils.tryNameClickable(newuser);
			groupBinding.NotifyTS3(tgCtx.message.chat.title, nuname + groupMessages.groupJoin);
			groupBinding.CheckAddUser(newuser);
		}
	});

	// Some TG user left a group
	bot.on("left_chat_member", (tgCtx) => {
		if (tgCtx.message.chat.type == "private") return;
		// group connection
		let groupBinding = Utils.getGroupLinking(tgCtx.message.chat.id);
		if (groupBinding == null) return;
		// the bot itself was removed from the group?
		if (tgCtx.message.left_chat_member.id == self.me.id) {
			// destroy binding & do nothing
			Utils.destroyGroupLinking(groupBinding, true);
			return;
		}
		// group messages
		let groupMessages = Utils.getLanguageMessages(groupBinding.language);
		// remove user from mapping
		let leftuser = Utils.getUser(tgCtx.message.left_chat_member);
		let luname = Utils.tryNameClickable(leftuser);
		groupBinding.NotifyTS3(tgCtx.message.chat.title, luname + groupMessages.groupLeave);
		groupBinding.RemoveUser(leftuser);
		return;
	});

	// listen for messages
	bot.on("text", (tgCtx) => {
		const msg = tgCtx.message;

		// user & data ctx for this received message
		const sender = Utils.getUser(msg.from);
		// get the sending user's instances
		const senderInstances = Utils.getUserInstances(sender.id);
		// get the sending user's selected instance
		const senderSelectedInstance = sender.selected !== "" ? Utils.getArrayObjectByName(senderInstances, sender.selected) : null;
		// Get users instance linkings
		const senderLinkings = Utils.getUserLinkings(sender.id);
		// Get user language messages
		const senderMessages = Utils.getLanguageMessages(sender.language);

		let ctx = {
			respondChat: (txt: string, opt: ExtraReplyMessage, noDel: boolean) => {
				self.sendNewMessage(msg.chat.id, txt, opt, noDel);
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
					keyboard: [],
					resize_keyboard: true,
					one_time_keyboard: true,
				},
				disable_web_page_preview: true,
			},
			isGroup: msg.chat.type !== "private",
		} as MessageCtx;

		// update last message id for eventual notification
		sender.last_msg_id = msg.message_id;

		// announcement check
		if (self.run && (!self.announces[ctx.chatId] || self.announces[ctx.chatId] < self.announceID)) {
			self.announces[ctx.chatId] = self.announceID;
			bot.telegram.sendMessage(ctx.chatId, self.announceText);
		}

		// If sent from group, try to get the group's binding and send the corresponding messages to it
		groupcheck: if (ctx.isGroup) {
			const title = (msg.chat as Chat.TitleChat).title;
			// Set/Update the current group name
			self.groupnames.set(ctx.chatId, title);
			// reply to messages in groups
			if (REPLY_IN_GROUPS) ctx.opt.reply_to_message_id = msg.message_id;
			// get the group Binding (if exists)
			ctx.groupLinking = Utils.getGroupLinking(ctx.chatId);
			if (!ctx.groupLinking) break groupcheck; // no linked server = abort
			// add user
			ctx.groupLinking.CheckAddUser(ctx.sender);
			// get messages for group language
			ctx.groupMessages = Utils.getLanguageMessages(ctx.groupLinking.language);
			// make Telegram user clickable
			let tsname = Utils.tryNameClickable(ctx.sender);

			// someone sent a message intended for ts3?
			if (self.run && msg.text && msg.text.substring(0, 1) !== "/") {
				// check for spam
				if (ctx.groupLinking.spamcheck) {
					// Check if user is ignored due to spam
					if (ctx.sender.banneduntil !== null) {
						if (new Date().getTime() - new Date(ctx.sender.banneduntil).getTime() < 0) return;
						// still ignoring
						else {
							// user is no longer ignored.
							ctx.sender.banneduntil = null;
							const nexTime = ((ctx.sender.spams + 1) * (ctx.sender.spams + 1) * 5).toString();
							try {
								self.sendNewMessage(ctx.sender.id, ctx.senderMessages.spamEnd.replace("<time>", nexTime), ctx.opt);
							} catch (err) {
								self.sendNewMessage(ctx.chatId, ctx.senderMessages.spamEnd.replace("<time>", nexTime), ctx.opt);
							}
						}
					} else if (self.antispam.CheckRegisterSpam(ctx.sender)) {
						// Spam detected
						const banTime = (ctx.sender.spams * ctx.sender.spams * 5).toString();
						try {
							self.sendNewMessage(ctx.sender.id, ctx.senderMessages.spamStart1.replace("<time>", banTime));
						} catch (err) {
							self.sendNewMessage(ctx.chatId, ctx.senderMessages.spamStart2.replace("<time>", banTime));
						}
						return;
					}
				}
				// send message
				ctx.groupLinking.NotifyTS3(title, tsname + " : " + Utils.fixUrlToTS3(msg.text));
			}
			// someone shared a file?
			else if (self.run && self.useFileProxy && ctx.groupLinking.sharemedia) {
				let mft = Utils.getMsgFileType(msg);
				if (mft !== null) {
					let proxiedFileUrl = self.fileProxyServer.getURL(msg, mft);
					console.log("Proxy URL: " + proxiedFileUrl);
					ctx.groupLinking.NotifyTS3(title, tsname + " (" + mft + "): " + Utils.fixUrlToTS3(proxiedFileUrl));
				}
			}
		}

		// Handle text message
		if (msg.text) {
			// Check if the text contains args and split them
			CommandHandler.prepare(ctx, msg.text);

			if (msg.from.id == self.developer_id && ctx.cmd && ctx.cmd.toLocaleLowerCase() == "/runtoggle") {
				self.run = !self.run;
				console.log("runtoggle: " + self.run);
				return;
			}

			if (!self.run) {
				console.log("no run, return.");
				return;
			}

			// '"developer bot shell"' (for unnecessary stuff like calculating something)
			if (msg.from.id == self.developer_id && ctx.cmd && ctx.cmd.toLocaleLowerCase() == "/xd") {
				let myeval = msg.text.substring(4, msg.text.length);
				console.log("/xd eval: " + myeval);
				ctx.respondChat(eval(myeval), ctx.opt);
				return;
			}

			// cancel command
			if (!ctx.isGroup && ctx.cmd && ctx.cmd.toLowerCase() == "/cancel") {
				bot.telegram.deleteMessage(msg.chat.id, msg.message_id);
				CommandHandler.cancel(ctx);
				return;
			}

			// check for menu
			if (!ctx.isGroup && ctx.sender.menu !== "") {
				if (ctx.cmd !== "") {
					ctx.opt.reply_markup = {
						keyboard: [["/cancel"]],
						resize_keyboard: true,
					};
					ctx.respondChat(ctx.senderMessages.actionCommand, ctx.opt);
					return;
				}
				/*
				 ** MENU ACTION HANDLER AREA
				 */
				self.actions.reduce(function (cont, obj) {
					if (!cont) return false;
					return obj.action.reduce(function (cont2, action) {
						if (cont2 && action.toLowerCase() === ctx.sender.menu.toLowerCase()) {
							console.log("ACTION: " + action + " by: " + msg.from.id);
							obj.callback(self, ctx);
							bot.telegram.deleteMessage(msg.chat.id, msg.message_id);
							return false;
						}
						return true;
					}, true);
				}, true);
			}

			/*
			 ** COMMAND HANDLER AREA
			 */
			if (ctx.cmd !== undefined) {
				CommandHandler.handle(self, ctx, 0, ctx.cmd);
			}
		}
	});
}
