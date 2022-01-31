"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3Ctx } from "../context";

import Utils from "../class/utils";

export default {
	id: 142,
	available: 3,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/unlink (link_name)",
	description: "unlink",
	command: ["/unlink"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		let o;
		if (ctx.isGroup) {
			// destroy
			Utils.destroyGroupLinking(ctx.groupLinking);
		} else {
			let msgs = ctx.senderMessages;
			if (ctx.args.length != 2 || !Utils.testName(ctx.args[1])) {
				ctx.respondChat(msgs.usage + this.usage, ctx.opt);
				return;
			}
			// Check if Name exists in deeplinkings
			let del;
			main.deeplinking.forEach((val, key) => {
				if (val.name == ctx.args[1]) del = key;
			});
			if (del) {
				main.deeplinking.delete(del);
				ctx.sender.menu = "";
				ctx.respondChat(msgs.linkDestroyed.replace("$link$", ctx.args[1]), ctx.opt);
			}
			// Check if Name exists in Bindings
			else if ((o = Utils.getArrayObjectByName(ctx.senderLinkings, ctx.args[1])) !== null) Utils.destroyGroupLinking(o);
			else ctx.respondChat(msgs.linkingNotFound, ctx.opt);
		}
	},
};
