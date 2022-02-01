"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3BotCtx, MessageCtx } from "../context";

export default {
	id: 12,
	action: ["set_name", "set_name_first"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		let msgs = ctx.senderMessages;
		if (ctx.senderSelectedInstance != null) {
			if (ctx.args.length == 1 && Utils.testName(ctx.args[0])) {
				ctx.senderSelectedInstance.clientname = ctx.args[0];
				// Output / Next
				let msg = msgs.setName;
				if (Utils.endsWith(ctx.sender.menu, "_first")) {
					ctx.sender.menu = "set_channel_first";
					msg += msgs.setNameFirst;
					ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("cancel", msgs)]];
				} else {
					ctx.sender.menu = "";
					let kb = [] as any[];
					let conSt = ctx.senderSelectedInstance.connectionState;
					if (conSt == 2) kb.push(Utils.getCmdBtn("reconnect", msgs));
					else if (conSt != 1) kb.push(Utils.getCmdBtn("connect", msgs));
					ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("menu", msgs)], kb];
				}
				ctx.respondChat(msg, ctx.opt);
			} else ctx.respondChat(msgs.nameError, ctx.opt);
		} else ctx.respondChat(msgs.noInstSelected, ctx.opt);
	},
};
