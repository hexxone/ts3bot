"use strict";

//
// Copyright (c) 2019 D.Thiele All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

const Loader = require("../class/loader.js").Get();

module.exports = {
	id: 115,
	available: 0,
	groupperm: false,
	needslinking: false,
	needsselected: false,
	usage: "/loaddata",
	description: "loaddata",
	command: ["/loaddata"],
	callback: function (main, ctx) {
		if (ctx.sender.id == ctx.developer_id) {
			if (ctx.args.length == 1) {
				Loader.loadData();
				// Notify
				ctx.respondChat(
					"Data loaded using key. There may be unexpected behaviour if the bot wasnt restarted recently.",
					ctx.opt
				);
			} else ctx.respondChat("Argument error.", ctx.opt);
		}
	},
};
