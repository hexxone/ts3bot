"use strict";

//
// Copyright (c) 2019 D.Thiele All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

const Utils = require("../class/utils.js").Get();

module.exports = {
	id: 7,
	action: ["pm_select_user"],
	callback: function (main, ctx) {
		Utils.fixRemoveKeyboard(main, ctx);
		ctx.opt.reply_markup.inline_keyboard = [
			[Utils.getCmdBtn("menu", ctx.senderMessages)],
		];

		// TODO
	},
};
