"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3Ctx } from "../context";

export default {
	id: 140,
	available: 3,
	groupperm: false,
	needslinking: true,
	needsselected: true,
	usage: "/susers",
	description: "susers",
	command: ["/susers"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		ctx.opt.parse_mode = "HTML";
		if (ctx.isGroup) {
			ctx.groupLinking.instance.GetSimpleUserString(ctx.groupLinking.language, ctx.groupLinking.ignorebots, (res) => {
				let mymsg = "<code>" + res + "</code>";
				ctx.respondChat(res, ctx.opt);
			});
		} else {
			ctx.senderSelectedInstance.GetSimpleUserString(ctx.sender.language, false, (res) => {
				ctx.respondChat(res, ctx.opt);
			});
		}
	},
};
