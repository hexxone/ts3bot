"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils from "../class/utils";

import { TS3BotCtx, MessageCtx } from "../context";

export default {
	id: 7,
	action: ["pm_select_user"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		Utils.fixRemoveKeyboard(main, ctx);
		ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("menu", ctx.senderMessages)]];

		// TODO
	},
};
