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
	id: 9,
	action: ["set_server", "set_server_first"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		const msgs = ctx.senderMessages;
		if (ctx.senderSelectedInstance != null) {
			if (ctx.args.length == 1 && ctx.args[0].includes("|")) {
				const splits = ctx.args[0].split("|");
				if (splits.length == 3) {
					ctx.senderSelectedInstance.addr = splits[0];
					// check for number && port
					if (Utils.isInt(splits[1]) || Utils.isInt(splits[2])) {
						ctx.senderSelectedInstance.qport = parseInt(splits[1]);
						ctx.senderSelectedInstance.serverPort = parseInt(splits[2]);
						// Output / Next
						let msg = ctx.senderMessages.setServer;
						if (Utils.endsWith(ctx.sender.menu, "_first")) {
							msg += ctx.senderMessages.setServerFirst;
							ctx.sender.menu = "set_account_first";
							ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("cancel", ctx.senderMessages)]];
						} else {
							ctx.sender.menu = "";
							const kb = [] as any[];
							const conSt = ctx.senderSelectedInstance.connectionState;
							if (conSt == QConState.Connected) kb.push(Utils.getCmdBtn("reconnect", msgs));
							else if (conSt != QConState.Connecting) kb.push(Utils.getCmdBtn("connect", msgs));
							ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("menu", msgs)], kb];
						}
						ctx.respondChat(msg, ctx.opt);
					} else ctx.respondChat(msgs.invalidFormatSrv, ctx.opt);
				} else ctx.respondChat(msgs.invalidFormatSrv, ctx.opt);
			} else ctx.respondChat(msgs.invalidFormatSrv, ctx.opt);
		} else ctx.respondChat(msgs.noInstSelected, ctx.opt);
	},
};
