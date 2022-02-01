"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3BotCtx } from "../context";

import Utils from "../class/utils";

export default {
	id: 131,
	hidden: true,
	available: 1,
	groupperm: false,
	needslinking: false,
	needsselected: true,
	usage: "/setserver",
	description: "setserver",
	command: ["/setserver"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		Utils.fixRemoveKeyboard(main, ctx);
		ctx.sender.menu = "set_server";
		ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("cancel", ctx.senderMessages)]];
		ctx.respondChat(ctx.senderMessages.setServerAddress, ctx.opt);
	},
};
