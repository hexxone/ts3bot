"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Utils, { CmdAvailable } from "../class/utils";

import { TS3BotCtx, MessageCtx } from "../context";

export default {
	id: 103,
	available: 3,
	groupperm: false,
	needslinking: false,
	needsselected: false,
	usage: "/commands",
	description: "commands",
	command: ["/commands"],
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		let isDev = ctx.sender.id == main.settings.developer_id;
		let cmsgs = ctx.senderMessages;
		if (ctx.groupMessages) cmsgs = ctx.groupMessages;

		if (ctx.args.length > 1 && ctx.args[1] != "-i") {
			// specific command requested?
			let ifomsg = cmsgs.commandResult;
			let resCnt = 0;
			let none = main.commands.some(function (obj, i) {
				if (obj.available > CmdAvailable.AdminOnly || (isDev && !ctx.isGroup)) {
					// build search string from command & language description
					let desc = cmsgs["cmd_" + obj.description];
					let searchString = obj.usage + desc;
					// contains search term? add to list
					if (searchString.includes(ctx.args[1])) {
						resCnt++;
						let cmdmsg = cmsgs.commandCommand;
						let extramsg = "";
						if (obj.needslinking) extramsg += "needs: linked server";
						if (obj.groupperm) {
							extramsg += extramsg !== "" ? " &" : "needs:";
							extramsg += " admin";
						}
						if (obj.needsselected) {
							extramsg += extramsg !== "" ? " or:" : "needs:";
							extramsg += " selected server";
						}
						// build available string
						let avail = Utils.avToStr(cmsgs, obj.available);
						if (extramsg !== "") avail += " (" + extramsg + ")";
						// build command string
						cmdmsg = cmdmsg.replace("$usage$", obj.usage);
						cmdmsg = cmdmsg.replace("$desc$", cmsgs["cmd_" + obj.description]);
						cmdmsg = cmdmsg.replace("$available$", avail);
						if (resCnt > 1) ifomsg += "\r\n--- --- --- --- --- --- --- ---";
						ifomsg += cmdmsg;
					}
					if (resCnt > 4) {
						ifomsg += "\r\n--- --- --- --- --- --- --- ---\r\n" + cmsgs.commandMax;
						return true;
					}
				}
				return false;
			});
			ctx.opt.parse_mode = "HTML";
			if (resCnt == 0) {
				ifomsg = cmsgs.commandNotFound;
			}
			ctx.respondChat(ifomsg.replace("$command$", ctx.args[1]), ctx.opt);
			// send message
			return;
		}
		// put detailed info behind a command, under what conditions its available?
		let info = ctx.args.length > 1 && ctx.args[1] == "-i";

		let msgtxt = cmsgs.availableCommands + "\r\n";
		let msgtxt2 = "";
		let hasLinking = ctx.groupLinking ? true : false;
		let hasAdmin = (hasLinking && (ctx.groupLinking.instance.id == ctx.sender.id || ctx.groupLinking?.alladmin)) || false;
		let hasSelected = ctx.senderSelectedInstance ? true : false;
		main.commands.some(function (obj, i) {
			if (obj.hidden) return;
			let isAvailable = true;
			if (ctx.isGroup && obj.available > CmdAvailable.SingleChat) {
				if (obj.groupperm) isAvailable = isAvailable && hasAdmin;
				if (obj.needslinking) isAvailable = isAvailable && hasLinking;
			} else if (!ctx.isGroup) {
				if (obj.available === CmdAvailable.AdminOnly) isAvailable = isAvailable && isDev;
				else if (obj.available === CmdAvailable.SingleChat || obj.available === CmdAvailable.All) {
					if (obj.needsselected) isAvailable = isAvailable && hasSelected;
				} else isAvailable = false;
			} else isAvailable = false;

			if (isAvailable) {
				let between = ctx.senderMessages["cmd_" + obj.description] || "empty";
				let overlen = obj.usage.length + between.length - (info ? 37 : 39);
				if (overlen > 0) between = between.substring(0, between.length - overlen - 2) + "..";
				// put detailed info behind a command, under what conditions its available
				let ifo = "";
				if (info) {
					if (ctx.isGroup) ifo += obj.groupperm ? "*" : " " + obj.needslinking ? "#" : " ";
					else ifo += obj.needsselected ? "~" : " ";
				}
				// if argument required, put in code brackets
				if (obj.usage.indexOf(" ") < 0) msgtxt += obj.usage + " (" + between + ") " + ifo + "\r\n";
				else msgtxt2 += "<code>" + obj.usage + "</code> (" + between + ") " + ifo + "\r\n";
			}
			return false;
		});
		msgtxt += msgtxt2;
		if (info) msgtxt += ctx.isGroup ? +cmsgs.commandsGroup : cmsgs.commandsChat;
		msgtxt += cmsgs.commandsDetail;
		ctx.opt.parse_mode = "HTML";
		if (!ctx.isGroup) ctx.opt.reply_markup.inline_keyboard = [[Utils.getCmdBtn("help", ctx.senderMessages)]];
		ctx.respondChat(msgtxt, ctx.opt);
	},
};
