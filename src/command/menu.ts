"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3BotCtx } from "../context";

import { QConState, Instance } from "../object/instance";
import Utils from "../class/utils";

export default {
	id: 117,
	available: 3,
	groupperm: false,
	needslinking: true,
	needsselected: false,
	usage: "/menu",
	description: "menu",
	command: ["/menu"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		Utils.fixRemoveKeyboard(main, ctx);
		let msgs = ctx.senderMessages;
		let msg = msgs.menu00 + "<code>";
		let ins!: Instance;
		const kbarr = [] as any[];
		ctx.opt.reply_markup.remove_keyboard = true;
		if (ctx.isGroup) {
			// group has linked server
			if (ctx.groupLinking) {
				msgs = ctx.groupMessages;
				ins = ctx.groupLinking.instance;
				const iusr = Utils.getUser({ id: ins.id });
				// build message
				msg = msgs.menu00 + "<code>" + msgs.menu01 + "\r\n" + msgs.langCurrent + msgs.info01 + "</code><a href='tg://user?id=" + ins.id + "'>" + iusr.GetName() + "</a><code>";
			} else {
				// print non specific info
				msg += "\r\n" + msgs.langCurrent + msgs.menu02;
			}
		} else {
			// no keyboard in group
			ctx.opt.reply_markup.inline_keyboard = kbarr;
			kbarr.push([Utils.getCmdBtn("manage", msgs)]);
			// add 'settings'
			// user has selected server
			if ((ins = ctx.senderSelectedInstance)) {
				// build message
				kbarr[0].push(Utils.getCmdBtn("settings", msgs));
				msg += msgs.menu05 + ins.name + msgs.info12 + ins.groups.length;
			} else {
				// print 'not selected' info
				msg += msgs.menu06;
				// can 'select server'?
				if (ctx.senderInstances.length > 0) kbarr.push([Utils.getCmdBtn("select", msgs)]);
			}
		}
		// 'connected' command array
		const conArr = [] as any[];
		// instance?
		if (ins) {
			msg += "\r\n</code>--- --- --- --- --- --- --- ---<code>";
			msg += msgs.info21 + Utils.stToStr(msgs, ins.connectionState);
			// connected?
			if (ins.connectionState == QConState.Connected) {
				// add 'users' command
				conArr.push(Utils.getCmdBtn("users", msgs));
				// add server infos
				const upTime = (ins.serverinfo.virtualserverUptime as number) * 1000 + (Date.now() - ins.lastPing.getTime());
				msg += msgs.info22 + ins.serverinfo.virtualserverName;
				msg += msgs.info23 + new String(ins.serverinfo.virtualserverVersion || "").split(" ")[0];
				msg += msgs.info24 + ins.serverinfo.virtualserverPlatform;
				msg += msgs.info25 + Utils.getTimeSpan(upTime, msgs);
				msg += msgs.info26 + ins.users.length + " / " + ins.serverinfo.virtualserverMaxclients;
				msg += msgs.info27 + ins.serverinfo.virtualserverChannelsonline;
			}
			// include admin keyboard for single chat
			if (!ctx.isGroup) {
				switch (ins.connectionState) {
					case QConState.Connected:
						conArr.push(Utils.getCmdBtn("reconnect", msgs));
					// eslint-disable-next-line no-fallthrough
					case QConState.Connecting:
						conArr.push(Utils.getCmdBtn("disconnect", msgs));
						break;
					default:
						conArr.push(Utils.getCmdBtn("connect", msgs));
						break;
				}
				kbarr.push(conArr); // add 'start'
			}
		}
		if (!ctx.isGroup) kbarr.push([Utils.getCmdBtn("start", msgs)]);
		msg += "</code>";
		// build message
		ctx.opt.parse_mode = "HTML";
		ctx.respondChat(msg, ctx.opt);
	},
};
