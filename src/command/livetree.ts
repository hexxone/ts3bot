"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3BotCtx } from "../context";

export default {
	id: 114,
	available: 3,
	groupperm: true,
	needslinking: true,
	needsselected: true,
	usage: "/livetree",
	description: "livetree",
	command: ["/livetree"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		ctx.opt.parse_mode = "HTML";
		if (ctx.args.length == 2 && ctx.args[1] == "stop") {
			if (ctx.isGroup) ctx.groupLinking.instance.RemoveLiveTree(ctx.chatId);
			else ctx.senderSelectedInstance.RemoveLiveTree(ctx.chatId);
		} else {
			if (ctx.isGroup) ctx.groupLinking.instance.AddLiveTree(ctx.chatId);
			else ctx.senderSelectedInstance.AddLiveTree(ctx.chatId);
		}
	},
};
