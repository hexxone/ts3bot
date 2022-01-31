"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3Ctx } from "../context";

export default {
	id: 144,
	available: 0,
	groupperm: false,
	needslinking: false,
	needsselected: false,
	usage: "/whinfo",
	description: "whinfo",
	command: ["/whinfo"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		if (ctx.sender.id == ctx.developer_id) {
			main.bot.telegram.getWebhookInfo().then((whi) => {
				console.log(whi);
				ctx.respondChat("Here is the WebHook info:\r\n\r\n" + JSON.stringify(whi), ctx.opt);
			});
		}
	},
};
