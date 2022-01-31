"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3Ctx } from "../context";

import Utils from "../class/utils";

export default {
	id: 121,
	available: 3,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/pm [on|off]",
	description: "pm",
	command: ["/pm"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		if (ctx.isGroup) {
			let usage = ctx.groupMessages.usage + this.usage;
			if (ctx.args.length == 2) {
				if (Utils.isYes(ctx.args[1])) {
					ctx.groupBinding.pm = true;
					ctx.respondChat(ctx.groupMessages.pmEnabled, ctx.opt);
				} else if (Utils.isNo(ctx.args[1])) {
					ctx.groupBinding.pm = false;
					ctx.respondChat(ctx.groupMessages.pmDisabled, ctx.opt);
				} else ctx.respondChat(usage, ctx.opt);
			} else ctx.respondChat(usage, ctx.opt);
		} else {
			// TODO add command /pmr, /pmsg, /pmserver, /pmuser
			// TODO change to reply markup
			ctx.opt.reply_markup.keyboard = [["send to selected"], ["select server"], ["select user"], ["/cancel"]];
			let msg = "TS3 PM:" + "\r\nlast server: " + "\r\nlast user:   " + "\r\nSelect action.";
			ctx.respondChat(msg, ctx.opt);

			// respond:
			// select server & user of last received whisper
			// action send_whisper

			// send selected:
			// action send_whisper

			// changeserver:
			// list ts3 servers of groups the user is member of as keyboard

			// changeuser:
			// list possible whisper targets on selected server

			// cancel:
			// leave this menu, leave whisper mode

			// put start
			// kbarr.push([Utils.getCmdBtn("start", msgs)]);
		}
	},
};
