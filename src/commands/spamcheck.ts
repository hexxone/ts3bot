"use strict";

//
// Copyright (c) 2019 D.Thiele All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

const Utils = require("../class/utils.js").Get();

module.exports = {
	id: 137,
	available: 2,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/spamcheck [on|off]",
	description: "spamcheck",
	command: ["/spamcheck"],
	callback: function (main, ctx) {
		let usage = ctx.groupMessages.usage + this.usage;
		if (ctx.args.length == 2) {
			let setmsg = ctx.groupMessages.spamCheck;
			if (Utils.isYes(ctx.args[1])) {
				ctx.groupBinding.spamcheck = true;
				ctx.respondChat(setmsg + ctx.groupMessages.optionOn, ctx.opt);
			} else if (Utils.isNo(ctx.args[1])) {
				ctx.groupBinding.spamcheck = false;
				ctx.respondChat(setmsg + ctx.groupMessages.optionOff, ctx.opt);
			} else ctx.respondChat(usage, ctx.opt);
		} else ctx.respondChat(usage, ctx.opt);
	},
};