"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils, { CmdAvailable } from "../class/utils";

import { TS3BotCtx, MessageCtx } from "../context";

export default {
	// prepares ctx strings from message
	prepare: function (ctx: MessageCtx, txt: string): void {
		let cmd = "";
		let args = txt.includes(" ") ? txt.split(" ") : [txt];
		// Check if the text starts as command and set it
		if (txt.startsWith("/")) {
			// if args, set first - else set text
			cmd = args.length > 1 ? args[0] : txt;
			// Check if the command contains a bot target
			// and set command without the bot name
			if (cmd.includes("@")) args[0] = cmd = cmd.split("@")[0];
		}
		ctx.cmd = cmd;
		ctx.args = args;
	},

	// handles cancel
	cancel: function (ctx: MessageCtx): boolean {
		ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("menu", ctx.senderMessages)]];
		if (ctx.sender.menu !== "") {
			let tmenu = ctx.sender.menu;
			ctx.sender.menu = "";
			ctx.respondChat(ctx.senderMessages.actionCancel + tmenu, ctx.opt);
			return true;
		} else ctx.respondChat(ctx.senderMessages.actionNoCancel, ctx.opt);
		return false;
	},

	// handles bot command
	handle: function (self: TS3BotCtx, ctx: MessageCtx, mode: number, value: string): boolean {
		return !self.commands.reduce(function (cont, obj) {
			// ID recognized?
			if (!cont) return false;
			if (mode == 1 && obj.id !== parseInt(value)) return true;
			let msgs = ctx.senderMessages;
			// loop possible alts
			return obj.command.reduce(function (cont2, command) {
				// command recognized?
				if (!cont2) return false;
				if (mode == 0 && command.toLowerCase() !== value.toLowerCase()) return true;
				let exec = false;
				if (ctx.isGroup) {
					// sent in group?
					if (ctx.groupLinking) msgs = ctx.groupMessages;
					if (obj.available > CmdAvailable.SingleChat) {
						// command is available in group?
						// does the group need a linked server?
						if (obj.needslinking && !(exec = ctx.groupLinking ? true : false)) self.sendNewMessage(ctx.chatId, msgs.commandNotLinked, ctx.opt);

						// does the command require admin permissions?
						if (obj.groupperm && !(exec = !ctx.groupLinking || ctx.groupLinking.instance.id == ctx.sender.id || ctx.groupLinking.alladmin))
							self.sendNewMessage(ctx.chatId, msgs.commandForbidden, ctx.opt);

						// if nothing was required, we can execute.
						exec = exec || (!obj.groupperm && !obj.needslinking);
					} else if (obj.available !== CmdAvailable.AdminOnly)
						// > dev commands 'dont exist' => dont respond at all
						self.sendNewMessage(ctx.chatId, msgs.commandErrChat1, ctx.opt);
				} else {
					// is admin command and sender is admin?
					if (obj.available === CmdAvailable.AdminOnly && ctx.sender.id == self.settings.developer_id) exec = true;
					// is group command ?
					else if (obj.available === CmdAvailable.Group) self.sendNewMessage(ctx.chatId, msgs.commandErrChat2, ctx.opt);
					else {
						if (obj.needsselected) {
							if (!(exec = ctx.senderSelectedInstance ? true : false)) {
								if (ctx.senderInstances.length > 0) self.sendNewMessage(ctx.chatId, ctx.senderMessages.commandNoSelect, ctx.opt);
								else self.sendNewMessage(ctx.chatId, ctx.sender.agreement ? msgs.commandNoAdded : msgs.commandNoTOS, ctx.opt);
							}
						} else exec = true;
					}
				}
				// only execute if conditions were met.
				if (exec) {
					console.log("COMMAND: " + command + " by: " + ctx.sender.id);
					// delete user messages in private chats, to keep them clean
					if (!ctx.isGroup && !ctx.isReply) self.bot.telegram.deleteMessage(ctx.chatId, ctx.msg.message_id);
					// execute function
					obj.callback(self, ctx);
				}
				return !exec;
			}, true);
		}, true);
	},
};
