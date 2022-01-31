"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { TS3Ctx, MessageCtx } from "../context";

export default {
	id: 107,
	hidden: true,
	available: 1,
	groupperm: false,
	needslinking: false,
	needsselected: false,
	usage: "/devmessage",
	description: "devmessage",
	command: ["/devmessage"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		if (!ctx.sender.sentdev) {
			ctx.sender.menu = "dev_message";
			ctx.respondChat(ctx.senderMessages.devSend, ctx.opt);
		} else ctx.respondChat(ctx.senderMessages.devWait, ctx.opt);
	},
};
