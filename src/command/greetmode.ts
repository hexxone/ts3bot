"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3BotCtx, MessageCtx } from "../context";
import { GreetMode } from "../object/instance";

export default {
	id: 109,
	available: 1,
	groupperm: false,
	needslinking: false,
	needsselected: true,
	usage: "/greetmode [off|join*|connect*] (*msg)",
	description: "greetmode",
	command: ["/greetmode"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		const msgs = ctx.senderMessages;
		let usage = msgs.usage + this.usage;
		if (ctx.args.length >= 2) {
			let opt = "";
			if (Utils.isNo(ctx.args[1])) {
				ctx.senderSelectedInstance.greetmode = GreetMode.Disabled;
				opt = msgs.optionOff;
			} else if (ctx.args[1].includes("join")) {
				ctx.senderSelectedInstance.greetmode = GreetMode.OnJoin;
				opt = msgs.greetOnJoin;
			} else if (ctx.args[1].includes("connect")) {
				ctx.senderSelectedInstance.greetmode = GreetMode.OnConnect;
				opt = msgs.greetConnect;
			} else {
				ctx.respondChat(usage, ctx.opt);
				return;
			}
			if (ctx.senderSelectedInstance.greetmode != GreetMode.Disabled && ctx.args.length > 2) {
				const gMsg = ctx.args.slice(2).join(" ");
				ctx.senderSelectedInstance.greetmsg = gMsg;
				opt += msgs.greetMsg + gMsg;
			}
			ctx.respondChat(msgs.setGreetMode + opt, ctx.opt);
		} else ctx.respondChat(usage, ctx.opt);
	},
};
