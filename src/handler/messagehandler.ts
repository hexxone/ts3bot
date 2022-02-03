"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { Chat } from "typegram";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

import { MessageCtx, TS3BotCtx } from "../context";

import Utils from "../class/utils";
import CommandHandler from "./commandhandler";

const REPLY_IN_GROUPS = false;

// Telegram message-receive-handler

export default function (self: TS3BotCtx) {
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

	// listen for files
	bot.on("document", (tgCtx) => {
		const msg = tgCtx.message;
		// user & data ctx for this received message
		const sender = Utils.getUser(msg.from);
		// we only care about groups for now
		if (msg.chat.type === "private") return;
		// Set/Update the current group name
		const title = (msg.chat as Chat.TitleChat).title;
		self.groupnames.set(msg.chat.id, title);
		// no linked server = abort
		const groupLinking = Utils.getGroupLinking(msg.chat.id);
		if (!groupLinking) return;
		// add user
		groupLinking.CheckAddUser(sender);

		// someone shared a file?
		if (self.settings.useFileProxy && groupLinking.sharemedia) {
			let mft = Utils.getMsgFileType(msg);
			if (mft !== null) {
				// inform proxy
				let proxiedFileUrl = self.fileProxyServer.getURL(msg, mft);
				console.log("Proxy URL: " + proxiedFileUrl);
				// make Telegram user clickable & send ts3 notification
				groupLinking.NotifyTS3(title, Utils.tryNameClickable(sender) + " (" + mft + "): " + Utils.fixUrlToTS3(proxiedFileUrl));
			}
		}
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
				return new Promise((res, rej) => {
					self.sendNewMessage(msg.chat.id, txt, opt, noDel).then((dat) => {
						res(dat as any);
					});
				});
			},
			msg: msg,
			text: msg.text,
			args: new Array<String>(),
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

		// announcement check
		if (!self.announces[ctx.chatId] || self.announces[ctx.chatId] < self.settings.announceID) {
			self.announces[ctx.chatId] = self.settings.announceID;
			bot.telegram.sendMessage(ctx.chatId, self.settings.announceText, { disable_web_page_preview: true });
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
			if (msg.text && msg.text.substring(0, 1) !== "/") {
				// check for spam
				if (ctx.groupLinking.spamcheck) {
					// Check if user is ignored due to spam
					if (ctx.sender.banneduntil !== null) {
						if (new Date().getTime() - new Date(ctx.sender.banneduntil).getTime() < 0) return;
						// still ignoring
						else {
							// user is no longer ignored.
							ctx.sender.banneduntil = null;
							const nexTime = ((ctx.sender.spams + 1) * 15).toString();
							const msg = ctx.senderMessages.spamEnd.replace("$time$", nexTime);
							try {
								self.sendNewMessage(ctx.sender.id, msg, ctx.opt);
							} catch (err) {
								self.sendNewMessage(ctx.chatId, msg, ctx.opt);
							}
						}
					} else if (self.antispam.CheckRegisterSpam(ctx.sender)) {
						// Spam detected
						const banTime = (ctx.sender.spams * 15).toString();
						const msg = ctx.senderMessages.spamStart1.replace("$time$", banTime);
						try {
							self.sendNewMessage(ctx.sender.id, msg);
						} catch (err) {
							self.sendNewMessage(ctx.chatId, msg);
						}
						return;
					}
				}
				// send message
				ctx.groupLinking.NotifyTS3(title, tsname + " : " + Utils.fixUrlToTS3(msg.text));
			}
		}

		// Handle text message
		if (msg.text) {
			// Check if the text contains args and split them
			CommandHandler.prepare(ctx, msg.text);

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
