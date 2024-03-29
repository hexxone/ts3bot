"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3BotCtx } from "../context";
import { QConState } from "../object/instance";

export default {
	id: 120,
	available: 3,
	groupperm: true,
	needslinking: true,
	needsselected: true,
	usage: "/reconnect",
	description: "reconnect",
	command: ["/reconnect"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		const msgs = ctx.senderMessages;
		if (ctx.isGroup) {
			if (ctx.groupLinking !== null) {
				if (ctx.groupLinking.instance.id == ctx.sender.id || ctx.groupLinking.alladmin) {
					if (ctx.groupLinking.instance.connectionState == QConState.Connected) {
						ctx.respondChat(ctx.groupMessages.serverReconnecting, ctx.opt);
						try {
							ctx.groupLinking.instance.connectTry = 0;
							ctx.groupLinking.instance.Disconnect(true);
						} catch (e) {
							ctx.respondChat(msgs.errorPrefix + JSON.stringify(e), ctx.opt);
						}
					}
				} else ctx.respondChat(msgs.notAllowed, ctx.opt);
			} else ctx.respondChat(msgs.notLinked, ctx.opt);
		} else {
			if (ctx.senderSelectedInstance !== null) {
				if (ctx.senderSelectedInstance.connectionState == QConState.Connected) {
					ctx.respondChat(ctx.senderMessages.serverReconnecting, ctx.opt);
					try {
						ctx.senderSelectedInstance.connectTry = 0;
						ctx.senderSelectedInstance.Disconnect(true);
					} catch (e) {
						ctx.respondChat(msgs.errorPrefix + JSON.stringify(e), ctx.opt);
					}
				}
			} else ctx.respondChat(msgs.noInstSelected, ctx.opt);
		}
	},
};
