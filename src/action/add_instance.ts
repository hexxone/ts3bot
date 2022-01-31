"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";
import { Instance } from "../object/instance";

import { TS3Ctx, MessageCtx } from "../context";

export default {
	id: 2,
	action: ["add_instance"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		if (ctx.args.length == 1 && Utils.testName(ctx.args[0])) {
			if (Utils.getArrayObjectByName(ctx.senderInstances, ctx.args[0]) == null) {
				let newInst = new Instance(main, ctx.sender.id, ctx.args[0]);
				main.instances.push(newInst);
				ctx.sender.selected = ctx.args[0];
				ctx.sender.menu = "set_server_first";
				ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("cancel", ctx.senderMessages)]];
				ctx.respondChat(ctx.senderMessages.addedServer, ctx.opt);
			} else ctx.respondChat(ctx.senderMessages.nameInUse, ctx.opt);
		} else ctx.respondChat(ctx.senderMessages.invalidName, ctx.opt);
	},
};
