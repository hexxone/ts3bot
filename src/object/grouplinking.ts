"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { TS3BotCtx } from "../context";

import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { Instance } from "./instance";
import { User } from "./user";

// represents a binding of a ts3 server to a Telegram group.
export class GroupLinking {
	main: TS3BotCtx;
	// instance.id = owner
	instance: Instance;
	// Given by the owner
	name: string;

	// Set when "deeplinking" gets added to group
	groupid: number;

	silent: boolean;
	notifyjoin: boolean;
	notifymove: number;

	channelchat: boolean;
	ignorebots: boolean;
	showgroupname: boolean;
	spamcheck: boolean;
	alladmin: boolean;
	pm: boolean;
	language: string;
	sharemedia: boolean;

	livetree?: number;
	lasttree?: string;
	lasterror?: string;

	users: User[];
	last_bot_msg_id: number;

	constructor(name: string, instance: Instance) {
		// reference to main
		this.main = instance.main;

		// data to be exported when saving
		this.name = name;
		this.instance = instance;
		this.groupid = 0;
		this.silent = false;
		this.notifyjoin = true;
		this.notifymove = 1; // 0 = off | 2 = channel | 3 = global
		this.channelchat = true; // chat with users in current ts3 bot channel

		this.ignorebots = true;
		this.showgroupname = true;
		this.spamcheck = true;
		this.alladmin = false;
		this.pm = false;
		// inherit owner language
		this.language = instance.owner().language;
		this.sharemedia = true;

		// dont export

		this.users = [];
		this.last_bot_msg_id = -1;
	}

	Export() {
		let userids = [] as number[];
		for (let usr of this.users) userids.push(usr.id);
		return {
			name: this.name,
			instance: {
				id: this.instance.id,
				name: this.instance.name,
			},
			groupid: this.groupid,
			silent: this.silent,
			notifyjoin: this.notifyjoin,
			notifymove: this.notifymove,
			channelchat: this.channelchat,
			ignorebots: this.ignorebots,
			showgroupname: this.showgroupname,
			spamcheck: this.spamcheck,
			alladmin: this.alladmin,
			pm: this.pm,
			language: this.language,
			sharemedia: this.sharemedia,
			livetree: this.livetree,
			lasttree: this.lasttree,
			lasterror: this.lasterror,
			userids: userids,
		};
	}

	// real init when added to group via link
	Link(groupid: number) {
		this.groupid = groupid;
		this.instance.AddGroup(groupid);
	}

	// destroy on /unlink or /delete
	Unlink() {
		this.instance.RemoveGroup(this.groupid);
	}

	// add user to virtual group when he sends a message in it
	CheckAddUser(userObj) {
		//console.log('CheckAddUser: ' + userObj.id);
		if (!this.HasUser(userObj)) this.users.push(userObj);
	}

	// check if group contains a user
	HasUser(userObj) {
		for (let usr of this.users) {
			if (usr.id == userObj.id) return true;
		}
		return false;
	}

	// removes user from group
	RemoveUser(userObj: User) {
		this.users = this.users.filter((val) => userObj.id != val.id);
	}

	// Sends a message to the server respecting chat mode and 'show group name'-option
	// URLS need to be fixed beforehand using Utils.fixUrlToTS3
	NotifyTS3(group: string, msg: string) {
		if (this.showgroupname) msg = group + " | " + msg;
		this.instance.SendChannelMessage(msg);
	}

	// Sends a mesage to the relating telegram group respecting the
	// .. 'show server name'- and notification-settings
	NotifyTelegram(msg: string) {
		let oobj = { parse_mode: "HTML" } as ExtraReplyMessage;
		if (this.silent) oobj.disable_notification = true;
		// notifications should be new messages, dont delete old
		this.main.sendNewMessage(this.groupid, msg, oobj, true);
	}
}
