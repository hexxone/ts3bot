"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3Ctx } from "../context";

export default {
	id: 141,
	available: 1,
	groupperm: false,
	needslinking: false,
	needsselected: false,
	usage: "/tos",
	description: "tos",
	command: ["/tos"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		let agree = "\r\n\r\n" + ctx.senderMessages.tosAgree.replace("<tos_string>", ctx.senderMessages.tosString);

		ctx.respondChat(ctx.senderMessages.tosText + (ctx.sender.agreement ? "" : agree), ctx.opt);

		if (!ctx.sender.agreement) ctx.sender.menu = "accept_tos";
	},
};
