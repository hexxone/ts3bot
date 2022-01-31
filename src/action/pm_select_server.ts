"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3Ctx, MessageCtx } from "../context";

export default {
	id: 6,
	action: ["pm_select_server"],
	callback: function (main: TS3Ctx, ctx: MessageCtx) {
		Utils.fixRemoveKeyboard(main, ctx);
		ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("menu", ctx.senderMessages)]];

		// TODO
	},
};
