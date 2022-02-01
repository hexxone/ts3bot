"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { MessageCtx, TS3BotCtx } from "../context";

import Utils from "../class/utils";

export default {
	id: 132,
	available: 3,
	groupperm: false,
	needslinking: true,
	needsselected: true,
	usage: "/settings",
	description: "settings",
	command: ["/settings"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		ctx.opt.parse_mode = "HTML";
		ctx.opt.reply_markup.one_time_keyboard = true;
		let msg = "_";
		if (ctx.isGroup) {
			let gmsgs = ctx.groupMessages;
			let grb = ctx.groupLinking;
			let secondLn = ["/showgroup " + !grb.showgroupname];
			msg = "<a href='tg://user?id=" + ctx.sender.id + "'>@</a> " + gmsgs.settings00 + "<code>";
			msg += gmsgs.settings01 + grb.alladmin;
			msg += gmsgs.settings02 + Utils.cmToStr(grb.language, grb.chatmode);
			if (main.useFileProxy) {
				secondLn.push("/sharemedia " + !grb.sharemedia);
				msg += gmsgs.settings03 + grb.sharemedia;
			}
			msg += gmsgs.settings04 + grb.showgroupname;
			msg += gmsgs.settings05 + grb.showservername;
			msg += gmsgs.settings06 + grb.ignorebots;
			msg += gmsgs.settings07 + grb.silent;
			msg += gmsgs.settings08 + grb.spamcheck;
			msg += gmsgs.settings09 + grb.notifyjoin;
			msg += gmsgs.settings10 + Utils.nmToStr(grb.language, grb.notifymove);
			msg += "</code>";
			// if sender admin or all admin set keyboard
			if (ctx.groupLinking.instance.id == ctx.sender.id || ctx.groupLinking.alladmin) {
				//console.log('commands admin');
				let nextChatMode = (grb.chatmode + 1) % 4;
				if (nextChatMode < 1) nextChatMode = 1;
				ctx.opt.reply_markup.keyboard = [
					["/menu"],
					["/admin4all " + !grb.alladmin, "/setchatmode " + Utils.cmToStr(ctx.sender.language, nextChatMode)],
					secondLn,
					["/showserver " + !grb.showservername, "/ignorebots " + !grb.ignorebots],
					["/silent " + !grb.silent, "/spamcheck " + !grb.spamcheck],
					["/notifyjoin " + !grb.notifyjoin, "/notifymove " + ((grb.notifymove + 1) % 3)],
				];

				ctx.opt.reply_markup.selective = true;
			}
		} else {
			let smsgs = ctx.senderMessages;
			let ssi = ctx.senderSelectedInstance;
			msg = smsgs.settings20 + "<code>";
			msg += smsgs.settings21 + ssi.name;
			msg += "\r\n</code>--- --- --- --- --- --- --- ---<code>";
			msg += smsgs.settings22 + ssi.addr;
			msg += smsgs.settings23 + ssi.qport;
			msg += smsgs.settings24 + ssi.serverPort;
			msg += smsgs.settings25 + ssi.qname;
			msg += smsgs.settings26 + ssi.qpass;
			msg += smsgs.settings27 + ssi.clientname;
			msg += smsgs.settings28 + ssi.channelname;
			msg += smsgs.settings29 + ssi.channeldepth;
			msg += smsgs.settings30 + ssi.autoconnect;
			msg += "</code>";
			// setttings keyboard, since sender is admin
			let ncd = ssi.channeldepth + 1;
			if (ncd > 5) ncd = 0;
			ctx.opt.reply_markup.keyboard = [["/menu"], ["/setserver", "/setaccount"], ["/setname", "/setchannel"], ["/setchanneldepth " + ncd, "/autoconnect " + !ssi.autoconnect]];
		}
		// send, dont reply/edit => telegram doesnt support that with default keyboard
		main.sendNewMessage(ctx.chatId, msg, ctx.opt);
	},
};
