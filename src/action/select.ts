"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { Instance } from "../object/instance";
import Utils from "../class/utils";

import { TS3BotCtx, MessageCtx } from "../context";

export default {
	id: 5,
	action: ["select"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		if (ctx.args.length == 1 && Utils.testName(ctx.args[0])) {
			let inst = Utils.getArrayObjectByName(ctx.senderInstances, ctx.args[0]) as Instance;
			if (inst != null) {
				Utils.fixRemoveKeyboard(main, ctx);
				// set new selected vars
				ctx.sender.menu = "";
				ctx.sender.selected = ctx.args[0];
				ctx.senderSelectedInstance = inst;

				// call menu command
				let cmdo = Utils.getCmdByDesc("menu");
				if (cmdo) cmdo.callback(main, ctx);
			} else ctx.respondChat(ctx.senderMessages.serverNotFound, ctx.opt);
		} else ctx.respondChat(ctx.senderMessages.invalidName, ctx.opt);
	},
};
