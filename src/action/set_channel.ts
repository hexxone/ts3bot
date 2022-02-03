"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3BotCtx, MessageCtx } from "../context";
import { QConState } from "../object/instance";

export default {
	id: 11,
	action: ["set_channel", "set_channel_first"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		let msgs = ctx.senderMessages;
		if (ctx.senderSelectedInstance != null) {
			if (ctx.text.length > 1 && ctx.text.length < 33) {
				ctx.senderSelectedInstance.channelname = ctx.text;
				// Output / Next
				let msg = msgs.channelSet;
				let kb = [] as any[];
				if (Utils.endsWith(ctx.sender.menu, "_first")) {
					kb.push(Utils.getCmdBtn("link", msgs));
					msg += "\r\n" + msgs.channelComplete;
				}
				let conSt = ctx.senderSelectedInstance.connectionState;
				if (conSt == QConState.Connected) kb.push(Utils.getCmdBtn("reconnect", msgs));
				else if (conSt != QConState.Connecting) kb.push(Utils.getCmdBtn("connect", msgs));
				ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("menu", msgs)], kb];
				ctx.sender.menu = "";
				ctx.respondChat(msg, ctx.opt);
			} else ctx.respondChat(msgs.channelNameErr, ctx.opt);
		} else ctx.respondChat(msgs.noInstSelected, ctx.opt);
	},
};
