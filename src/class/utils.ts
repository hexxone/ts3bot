"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import Process from "process";
import { User } from "typegram";

import urlRegex from "url-regex-safe";

import { MessageCtx, TS3BotCtx, TS3BotMsgs } from "../context";

import * as UHelper from "../object/user";
import { QConState, Instance, GreetMode } from "../object/instance";
import { GroupLinking, MoveNotification } from "../object/grouplinking";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

export const DefaultOpt: ExtraReplyMessage = { parse_mode: "HTML", disable_web_page_preview: true };

const CUR_YR = new Date().getFullYear();
const LEAP_YEAR = !(CUR_YR & 3 || (!(CUR_YR % 25) && CUR_YR & 15));
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = MS_PER_SECOND * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;
const MS_PER_YEAR = MS_PER_DAY * (LEAP_YEAR ? 366 : 365);

// command chat availability, 0 = admin only, 1 = single chat, 2 = group, 3 = chat & group
export enum CmdAvailable {
	AdminOnly = 0,
	SingleChat = 1,
	Group = 2,
	All = 3,
}

class Utils {
	// 'this' of main.js (instanciated on run)
	Parent!: TS3BotCtx;

	// fills Mathods.Parent with a reference to main.js (users, groups, etc)
	Set(self) {
		this.Parent = self;
	}

	// returns a number with leading 0 if < 10
	get2Dig(num: number) {
		return num == 0 ? "00" : num && num < 10 ? "0" + num : num;
	}

	// Time helper
	getTime(d: Date) {
		return (
			[d.getFullYear(), this.get2Dig(d.getMonth() + 1), this.get2Dig(d.getDate())].join("-") +
			" " +
			[this.get2Dig(d.getHours()), this.get2Dig(d.getMinutes()), this.get2Dig(d.getSeconds())].join(":")
		);
	}

	// Returns a User Object with the given id
	// (creates and adds it to existing users if not already in)
	getUser(tg_user: Partial<User>): UHelper.User {
		if (!tg_user) return null as any;
		// check if the user-id is already known
		// and check for updated name props
		for (const user of this.Parent.users)
			if (user.id == tg_user.id) {
				if (tg_user.username && user.username != tg_user.username) {
					console.log("Update username: " + tg_user.id);
					user.username = tg_user.username;
				}
				if (tg_user.first_name && user.first_name != tg_user.first_name) {
					console.log("Update first_name: " + tg_user.id);
					user.first_name = tg_user.first_name;
				}
				if (tg_user.last_name && user.last_name != tg_user.last_name) {
					console.log("Update last_name: " + tg_user.id);
					user.last_name = tg_user.last_name;
				}
				return user;
			}
		// we didnt find one...
		console.log("New User: " + tg_user.id);
		// try to get the user-specific language, or fallback to the default.-
		// then get the validated language code
		const lang = this.getLanguageMessages(tg_user.language_code ? tg_user.language_code : "").langCode;
		// finally create the user
		const newUser = new UHelper.User(tg_user.id || 0, tg_user.username || "err", tg_user.first_name || "err", tg_user.last_name || "err", lang);
		this.Parent.users.push(newUser);
		return newUser;
	}

	// Gets all the Instance the User with the given id owns
	getUserInstances(id: number): Instance[] {
		const res = [] as Instance[];
		for (const instance of this.Parent.instances) {
			if (instance.id == id) res.push(instance);
		}
		return res;
	}

	// Gets all the Linkings the User with the given id has
	getUserLinkings(id: number): GroupLinking[] {
		const res = [] as GroupLinking[];
		for (const linking of this.Parent.linkings) {
			if (linking.instance.id == id) res.push(linking);
		}
		return res;
	}

	// Finds a Linking for a group with the given id
	// (or null if not found)
	getGroupLinking(groupid: number): GroupLinking {
		for (const linking of this.Parent.linkings) {
			if (linking.groupid == groupid) return linking;
		}
		return null as any;
	}

	// Finds Instances and Linkings from Object Array by Name
	getArrayObjectByName(arr: Partial<Instance | GroupLinking>[], name) {
		for (const instance of arr) if ((instance.name || "").toLowerCase() == name.toLowerCase()) return instance;
		return null;
	}

	// returns statistics string, param s is messages.
	getStats(s: TS3BotMsgs) {
		let msg = "";
		const upTime = new Date().getTime() - this.Parent.startDate.getTime();
		msg += s.stats01 + this.getTimeSpan(upTime, s);
		msg += s.stats02 + this.Parent.receivedMessages;
		msg += s.stats03 + this.Parent.users.length;
		msg += s.stats04 + this.Parent.groupnames.size;
		msg += s.stats05 + this.Parent.instances.length;
		msg += s.stats06 + this.Parent.linkings.length;
		let ts3users = 0;
		for (const linking of this.Parent.linkings) {
			if (linking.instance.connectionState == QConState.Connected) {
				ts3users += linking.instance.users.length;
			}
		}
		msg += s.stats07 + ts3users;
		const used = Process.memoryUsage().heapUsed / 1024 / 1024;
		msg += s.stats08 + Math.round(used * 100) / 100 + " MB";
		return msg;
	}

	// get a millisecond timespan string-formatted in given language
	getTimeSpan(ms: number, msgs: TS3BotMsgs) {
		ms = Math.abs(ms); // dont be so negative
		const years = Math.round(ms / MS_PER_YEAR),
			dms = ms % MS_PER_YEAR,
			days = Math.round(dms / MS_PER_DAY),
			hms = dms % MS_PER_DAY,
			hours = Math.round(hms / MS_PER_HOUR),
			mms = hms % MS_PER_HOUR,
			mins = Math.round(mms / MS_PER_MINUTE),
			sms = mms % MS_PER_MINUTE,
			secs = Math.round(sms / MS_PER_SECOND);
		let res = "";
		if (years > 0) res += `${years} ${msgs.timeYears}`;
		if (res != "" || days > 0) res += ` ${days} ${msgs.timeDays}`;
		if (res != "" || hours > 0) res += ` ${hours} ${msgs.timeHours}`;
		if (res != "" || mins > 0) res += ` ${mins} ${msgs.timeMins}`;
		res += ` ${secs} ${msgs.timeSecs}`; // always... at least
		return res.trim();
	}

	// Regex tests a String meant to be a name
	testName(name) {
		return name.match(/^[a-zA-Z0-9]{2,32}$/) !== null;
	}

	// returns messages-object for the desired language
	getLanguageMessages(lang?: string): TS3BotMsgs {
		let deff;
		for (const msgobj of this.Parent.languages) {
			if (msgobj.langCode === lang || msgobj.langName === lang) return msgobj;
			if (msgobj.langCode === this.Parent.settings.defaultLanguage) deff = msgobj;
		}
		return deff;
	}

	// returns the file type string for a telegram message
	getMsgFileType(msg) {
		if (!msg) return null;
		const fileTypeArr = ["file", "audio", "document", "photo", "sticker", "video", "voice"];
		for (const ft of fileTypeArr) if (msg[ft]) return ft;
		return null;
	}

	// if a user blocks the bot from sending messages, destroy him
	destroyUser(usr: UHelper.User) {
		// Remove all instances (& linkings) with this User
		this.Parent.instances.forEach((instance) => {
			if (instance.id == usr.id) this.destroyInstance(instance, false, true);
		});
		// Remove User
		this.Parent.users = this.Parent.users.filter((user) => {
			// Check if is this is the user we want to destroy
			return user.id != usr.id;
		});
	}

	destroyInstance(ins: Instance, noGroupMsg?: boolean, noUsrMsg?: boolean) {
		// Remove all Linkings with this Instance
		this.Parent.linkings.forEach((linking) => {
			if (linking.instance.id == ins.id) this.destroyGroupLinking(linking, noGroupMsg, noUsrMsg);
		});
		// Disconnect from the Server
		ins.Disconnect();
		// Remove Instance
		this.Parent.instances = this.Parent.instances.filter((instance) => {
			const filtr = instance.id != ins.id || instance.name != ins.name;
			if (!filtr && !noUsrMsg) {
				const usr = this.getUser({ id: instance.id });
				const msgs = this.getLanguageMessages(usr.language);
				this.Parent.sendNewMessage(usr.id, msgs.serverDeleted);
			}
			return filtr;
		});
	}

	// destroys a given group linking
	destroyGroupLinking(lnk: GroupLinking, noGroupMsg?: boolean, noUsrMsg?: boolean) {
		// Remove Linking
		this.Parent.linkings = this.Parent.linkings.filter((linking) => {
			// Check if is this is the linking we want to destroy
			if (linking.instance.id != lnk.instance.id || linking.name != lnk.name) return true;
			// Notify user (if not blocked)
			if (!noUsrMsg) {
				const usr = this.getUser({ id: lnk.instance.id });
				const msgs = this.getLanguageMessages(usr.language);
				this.Parent.sendNewMessage(usr.id, msgs.linkingDestroyed.replace("$linking$", linking.name));
			}
			// notify group (if not removed)
			if (!noGroupMsg) {
				const grp = this.getGroupLinking(linking.groupid);
				const gmsgs = this.getLanguageMessages(grp.language);
				this.Parent.sendNewMessage(linking.groupid, gmsgs.serverUnlinked);
			}
			linking.Unlink();
			return false;
		});
	}

	// removes the keyboard and overwrites the response function
	fixRemoveKeyboard(main: TS3BotCtx, ctx: MessageCtx) {
		const tg = main.bot.telegram;
		const cid = ctx.chatId;
		tg.sendMessage(cid, "🕐...", { reply_markup: { remove_keyboard: true } }).then((data) => tg.deleteMessage(cid, data.message_id));
	}

	// returns a command by its description name
	getCmdByDesc(desc: string) {
		const objs = this.Parent.commands.filter(function (obj) {
			return obj.description == desc;
		});
		if (objs.length == 1) return objs[0];
		return null;
	}

	// Get Command as Button
	getCmdBtn(desc: string, msgs: TS3BotMsgs) {
		if (desc == "cancel")
			return {
				text: msgs["cmd_cancel"],
				callback_data: "cc",
			};
		const obj = this.getCmdByDesc(desc);
		if (obj)
			return {
				text: msgs["cmd_" + desc],
				callback_data: "c" + obj.id,
			};
		else
			return {
				text: "Error: " + desc,
				callback_data: "e",
			};
	}

	// Returns a Random string of desired length
	randomString(length: number) {
		let text = "";
		const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	}

	// Returns a bool if the given value is type of integer.
	isInt(value) {
		let x;
		return isNaN(value) ? !1 : ((x = parseFloat(value)), (0 | x) === x);
	}

	// returns whether the value indicates a positive meaning string
	isYes(value) {
		return ["1", "an", "jo", "ein", "einschalten", "aktivieren", "aktiviert", "aktiv", "on", "yes", "yep", "true", "enable", "enabled", "amk", "fly"].includes(value.toLowerCase());
	}

	// returns whether the value indicates a negative meaning string
	isNo(value) {
		return ["0", "aus", "ausschalten", "nö", "deaktivieren", "deaktiviert", "inaktiv", "off", "no", "nope", "false", "disable", "disabled", "meh", "lame"].includes(value.toLowerCase());
	}

	// Doesnt need a comment, but OCD
	endsWith(hay, s) {
		return hay.length >= s.length && hay.substr(hay.length - s.length) == s;
	}

	// converts notify move mode (number) to string
	nmToStr(msgs: TS3BotMsgs, number: MoveNotification) {
		switch (number) {
			case 1:
				return "Channel";
			case 2:
				return "Global";
			default:
				return msgs.optionOff;
		}
	}

	// converts connection state to language string
	stToStr(msgs: TS3BotMsgs, number: QConState) {
		switch (number) {
			case 1:
				return msgs.stateConnecting;
			case 2:
				return msgs.stateConnected;
			case 3:
				return msgs.stateError;
			default:
				return msgs.stateIdle;
		}
	}

	// converts available number to string
	avToStr(msgs: TS3BotMsgs, available: CmdAvailable) {
		switch (available) {
			case 0:
				return msgs.availableDev;
			case 1:
				return msgs.availableChat;
			case 2:
				return msgs.availableGroup;
			default:
				return msgs.availableAll;
		}
	}

	// converts greetmode number to string
	gmToStr(msgs: TS3BotMsgs, greetmode: GreetMode) {
		switch (greetmode) {
			default:
				return msgs.optionOff;
			case GreetMode.OnJoin:
				return msgs.greetOnJoin;
			case GreetMode.OnConnect:
				return msgs.greetConnect;
		}
	}

	// trys to make a Telegram user name a clickable link
	tryNameClickable(userObj: UHelper.User) {
		// make Telegram user clickable
		let tsname = userObj.GetName();
		if (tsname.startsWith("@")) tsname = "[URL=https://t.me/" + tsname.substring(1, tsname.length) + "]" + tsname + "[/URL]";
		return tsname;
	}

	// will surround urls with given TAG for being clickable TS3
	fixUrlToTS3(str: string) {
		// make urls clickable for ts3 clients
		const urll = str.match(urlRegex());
		if (urll) {
			if (urll instanceof Array) {
				for (let i = 0; i < urll.length; i++) str = str.replace(urll[i], "[URL]" + urll[i] + "[/URL]");
			} else str = str.replace(urll, "[URL]" + urll + "[/URL]");
		}
		return str;
	}

	// converts an 'int' to a string with lower cased numbers
	getNumberSmallASCII(num: string) {
		const str = num.toString(),
			narr = "₀₁₂₃₄₅₆₇₈₉".split("");
		let res = "";
		for (let i = 0; i < str.length; i++) {
			const a = str.charAt(i);
			const x = parseInt(a);
			if (narr[x]) res += narr[x];
		}
		return res;
	}
}

export default new Utils();
