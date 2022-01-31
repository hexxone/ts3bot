"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3Ctx, MessageCtx } from "../context";

export default {
	id: 3,
	action: ["delete_instance"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		if (ctx.senderSelectedInstance != null) {
			if (ctx.text == ctx.senderMessages.delConfirmStr + ctx.sender.selected) {
				ctx.sender.menu = "";
				// Remove all Linkings with this Instance
				main.linkings = main.linkings.filter(function (linking) {
					// Check if is senderLinking and linking is affected
					if (linking.instance.id != ctx.sender.id || Utils.getArrayObjectByName(ctx.senderLinkings, linking.name) == null || !ctx.senderSelectedInstance.HasGroup(linking.groupid))
						return true;
					// Notify, Unregister and remove it
					ctx.respondChat(ctx.senderMessages.linkingDestroyed.replace("<linking>", linking.name), ctx.opt);
					main.sendNewMessage(linking.groupid, ctx.senderMessages.serverUnlinked, ctx.opt);
					linking.Unlink();
					return false;
				});
				// Disconnect from the Server
				ctx.senderSelectedInstance.Disconnect();
				// Remove Instance
				main.instances = main.instances.filter(function (instance) {
					return instance.id != ctx.senderSelectedInstance.id || instance.name != ctx.senderSelectedInstance.name;
				});
				// Deselect
				ctx.sender.selected = "";
				// Success Message
				ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("menu", ctx.senderMessages)]];
				ctx.respondChat(ctx.senderMessages.serverDeleted, ctx.opt);
			} else ctx.respondChat(ctx.senderMessages.deleteError, ctx.opt);
		} else ctx.respondChat(ctx.senderMessages.noInstSelected, ctx.opt);
	},
};