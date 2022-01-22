"use strict";

//
// Copyright (c) 2019 D.Thiele All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

const Utils = require("../class/utils.js").Get();

module.exports = {
	id: 135,
	available: 2,
	groupperm: true,
	needslinking: true,
	needsselected: false,
	usage: "/showserver [on|off]",
	description: "showserver",
	command: ["/showserver"],
	callback: function (main, ctx) {
		let usage = ctx.groupMessages.usage + this.usage;
		if (ctx.args.length == 2) {
			if (Utils.isYes(ctx.args[1])) {
				ctx.groupBinding.showservername = true;
				ctx.respondChat(ctx.groupMessages.serverNameShown, ctx.opt);
			} else if (Utils.isNo(ctx.args[1])) {
				ctx.groupBinding.showservername = false;
				ctx.respondChat(ctx.groupMessages.serverNameHidden, ctx.opt);
			} else ctx.respondChat(usage, ctx.opt);
		} else ctx.respondChat(usage, ctx.opt);
	},
};