"use strict";

//
// Copyright (c) 2019 D.Thiele All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

const Utils = require("../class/utils.js").Get();

module.exports = {
	id: 136,
	available: 2,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/silent [on|off]",
	description: "silent",
	command: ["/silent"],
	callback: function (main, ctx) {
		let usage = ctx.groupMessages.usage + this.usage;
		let setmsg = ctx.groupMessages.silentMode;
		if (ctx.args.length == 2) {
			if (Utils.isYes(ctx.args[1])) {
				ctx.groupBinding.silent = true;
				ctx.respondChat(setmsg + ctx.groupMessages.optionOn, ctx.opt);
			} else if (Utils.isNo(ctx.args[1])) {
				ctx.groupBinding.silent = false;
				ctx.respondChat(setmsg + ctx.groupMessages.optionOff, ctx.opt);
			} else ctx.respondChat(usage, ctx.opt);
		} else ctx.respondChat(usage, ctx.opt);
	},
};
