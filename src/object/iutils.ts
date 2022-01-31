"use strict";

import { TeamSpeakChannel, TeamSpeakClient } from "ts3-nodejs-library";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

export type TSInfo = {
	virtualserver_name: string;
	virtualserver_maxclients: number;
};

export type TSUser = {
	clid: string; // client id
	cid: string; // residing channel id
	client_type: number; // query or user?
	client_nickname: string;
	client_database_id: number; // persistent uid
};

export type TSChannel = {
	id: string;
	channel_name: string;
	cid: string;
	pid: string;
};

// ts3 connection utils
export class IUtils {
	users: TeamSpeakClient[];
	channels: TeamSpeakChannel[];
	channelid: number;

	constructor() {
		// the users and channels are already correctly sorted when received.
		this.users = [];
		this.channels = [];
		this.channelid = 0;
	}

	// this function will re-sort the user list alphabetically by name after a user joined.
	// this is required to have the correct user-order in channels (/livetree and /users).
	// you dont have to do it after leave since the array just gets spliced at correct position.
	SortUsers() {
		this.users.sort(function (a, b) {
			return a.nickname < b.nickname ? -1 : a.nickname == b.nickname ? 0 : 1;
		});
	}

	// returns the server's user count, bots can be ignored
	GetUserCount(ignorebots) {
		let cnt = this.users.length;
		// subtract query clients
		if (ignorebots) {
			for (let usr of this.users) if (usr.type == 1) cnt--;
		}
		return cnt;
	}

	// find channel object by name
	GetChannelByName(name): TeamSpeakChannel {
		for (let chn of this.channels) {
			if (chn.name == name) return chn;
		}
		return null as any;
	}

	// find channel object by channel id
	GetChannelById(id): TeamSpeakChannel {
		for (let chn of this.channels) {
			if (chn.cid == id) return chn;
		}
		return null as any;
	}

	// find users by channel id, bots can be ignored
	GetChannelUser(cid: string, ignorebots): TeamSpeakClient[] {
		let userArr = [] as TeamSpeakClient[];
		// Add users to array grouped by channel
		for (let usr of this.users) {
			// if wrong channel, ignore
			if (usr.cid != cid) continue;
			// if this is a query client, ignore him
			if (usr.type == 1 && ignorebots) continue;
			// push user to respective 'channel'-array
			userArr.push(usr);
		}
		return userArr;
	}

	// returns all Child-channels of a given channel-id.
	GetChannelsBymain(id): TeamSpeakChannel[] {
		let res = [] as TeamSpeakChannel[];
		for (let chn of this.channels) {
			if (chn.pid == id) res.push(chn);
		}
		return res;
	}

	// returns if there are any users in the channel tree below
	GetAnyTreeUsers(cid: string): boolean {
		if (this.GetChannelUser(cid, false).length > 0) return true;
		let chns = this.GetChannelsBymain(cid);
		for (let chn of chns) {
			if (this.GetAnyTreeUsers(chn.cid)) return true;
		}
		return false;
	}

	/*
	 *  STRING UTILITIES
	 */

	// returns the longest's row length of a text
	longestRow(str): number {
		if (!str.match("\r\n")) return str.length;
		return str.split("\r\n").sort((a, b) => b.length - a.length)[0].length;
	}

	// returns the adequate channel flag
	getChannelFlag(channel): string {
		if (channel.cid == this.channelid) return "📍";
		if (channel.channel_flag_default == 1) return "🏠";
		if (channel.channel_flag_password == 1) return "🔒";
		return "💬";
	}

	// returns the adequate user audio flag
	getUserAudioFlag(user): string {
		if (user.client_type == 1) return "🤖";
		if (user.client_away == 1) return this.getClockEmoji(user.client_idle_time);
		if (user.client_output_muted == 1) return "🔇";
		if (user.client_input_muted == 1) return "🤐";
		if (user.client_is_recording == 1) return "🔴";
		if (user.client_is_channel_commander == 1) return "⭐️";
		if (user.client_is_priority_speaker == 1) return "Ⓜ️";
		return "🔵";
	}

	// returns the clock emoji closest to the given (idle) time
	getClockEmoji(timeSpan): string {
		let a = new Date(timeSpan);
		let d = ~~((a.getHours() % 12) * 2 + a.getMinutes() / 30 + 0.5);
		d += d < 2 ? 24 : 0;
		return String.fromCharCode(55357, 56655 + (d % 2 ? 23 + d : d) / 2);
	}

	// Function that excludes the [spacer] strings from channel names
	fixSpacer(str): string {
		return String(str).replace(/(\[\*{0,1}[l,r,c]{0,1}spacer[0-9]{0,}\])/g, "");
	}

	// Function that actually fixes the [spacer] strings from channel names
	fixSpacers(str): string {
		// get longest row's length
		let longest = this.longestRow(str);

		// left spacers will be displayed like normal channels but without Icon in front
		// the icon will be captured in the following regex and removed.
		let noLSpacer = String(str).replace(/(.*\[\*{0,1}lspacer[0-9]{0,}\])/g, "");

		// fix right and center spacers
		let spacers = [...noLSpacer.matchAll(/(.*\[\*{0,1}[c,r]{1}spacer[0-9]{0,}\])(.*)/g)];
		for (let spacer of spacers) {
			// 0=wohle match, 1=1st capture group 2=2nd capture group etc.
			let txt = spacer[2].trim();
			// get amount of spaces for correct positioning
			let spaceCnt = longest - txt.length;
			// if centered spacer, divide by 2
			if (spacer[1].match("cspacer")) spaceCnt /= 2;
			// rebuild and replace the old row
			// ~~ = math.floor after divide
			let realRow = this.getSpaces(~~spaceCnt) + txt;
			noLSpacer = noLSpacer.replace(spacer[0], realRow);
		}

		// fix repeating spacers
		// => *spacer is same as spacer
		let repeating = [...noLSpacer.matchAll(/(.*\[\*{0,1}spacer[0-9]{0,}\])(.*)/g)];
		for (let repeat of repeating) {
			// 0=wohle match, 1=1st capture group 2=2nd capture group etc.
			let txt = repeat[2].trim();
			// rebuild and replace the old row
			let realRow = txt;
			while (realRow.length < longest) realRow += txt;
			if (realRow.length > longest) realRow = realRow.substring(0, longest - 1);
			noLSpacer = noLSpacer.replace(repeat[0], realRow);
		}
		// done
		return noLSpacer;
	}

	// function to return given amount of spaces
	getSpaces(count): string {
		let sp = "";
		for (let i = 0; i < count; i++) sp += " ";
		return sp;
	}

	// fix ip address leak for ts3 bot names
	fixNameToTelegram(str): string {
		let ip = str.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\:?([0-9]{1,5})?/);
		if (ip) {
			if (ip instanceof Array) {
				for (let i = 0; i < ip.length; i++) str = str.replace(ip[i], "[IP]");
			} else {
				str = str.replace(ip, "[IP]");
			}
		}
		return str;
	}

	// removes [URL]-Tags from links
	fixUrlToTelegram(str): string {
		return str.replace(/\[\/*URL\]/g, "");
	}

	// Function for escaping a string message before sending
	escapeStr(str: string): string {
		return String(str)
			.replace(/\\/g, "\\\\")
			.replace(/\//g, "\\/")
			.replace(/\|/g, "\\p")
			.replace(/\n/g, "\\n")
			.replace(/\r/g, "\\r")
			.replace(/\t/g, "\\t")
			.replace(/\v/g, "\\v")
			.replace(/\f/g, "\\f")
			.replace(/ /g, "\\s");
	}

	// Function for un-escaping a string message after receiving
	unescapeStr(str: string): string {
		return String(str)
			.replace(/\\\\/g, "\\")
			.replace(/\\\//g, "/")
			.replace(/\\p/g, "|")
			.replace(/\\n/g, "\n")
			.replace(/\\r/g, "\r")
			.replace(/\\t/g, "\t")
			.replace(/\\v/g, "\v")
			.replace(/\\f/g, "\f")
			.replace(/\\s/g, " ");
	}

	// teamspeak3 library is using parameter arrays since all data fields
	// are always sent per object and it uses a little bit less memory.
	// Its however not very practical to sort or work with.
	// This function reformats the given data to object arrays..
	// from:  parameter array object {'a':['1','4'],'b':['2','5'],'c':['3','6']}
	// to:    object array           [{'a':'1','b':'2','c':'3'},{'a':'4','b':'5','c':'6'}]
	formatData(data: object): object[] {
		return Object.keys(data).reduce((arr: any[], key) => {
			if (data[key] instanceof Array) {
				data[key].forEach((value, i) => {
					if (!arr[i]) arr[i] = {};
					arr[i][key] = value;
				});
			}
			return arr;
		}, []);
	}
}
