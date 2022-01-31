"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3Ctx } from "../context";

import Loader from "../class/loader";

export default {
	id: 124,
	available: 0,
	groupperm: false,
	needslinking: false,
	needsselected: false,
	usage: "/savedata",
	description: "savedata",
	command: ["/savedata"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		if (ctx.sender.id == ctx.developer_id) {
			if (ctx.args.length == 1) {
				Loader.saveData();
				// Notify
				ctx.respondChat("Data saved.", ctx.opt);
			} else ctx.respondChat("Argument error.", ctx.opt);
		}
	},
};
