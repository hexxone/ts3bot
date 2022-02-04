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
	myChannel!: TeamSpeakChannel;

	constructor() {
		// the users and channels are already correctly sorted when received.
		this.users = [];
		this.channels = [];
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
	GetUserCount(ignorebots: boolean) {
		let cnt = this.users.length;
		// subtract query clients
		if (ignorebots) for (const usr of this.users) if (usr.type == 1) cnt--;
		return cnt;
	}

	// find channel object by name
	GetChannelByName(name): TeamSpeakChannel {
		for (const chn of this.channels) {
			if (chn.name == name) return chn;
		}
		return null as any;
	}

	// find channel object by channel id
	GetChannelById(id): TeamSpeakChannel {
		for (const chn of this.channels) {
			if (chn.cid == id) return chn;
		}
		return null as any;
	}

	// find users by channel id, bots can be ignored
	GetChannelUser(cid: string, ignorebots): TeamSpeakClient[] {
		const userArr = [] as TeamSpeakClient[];
		// Add users to array grouped by channel
		for (const usr of this.users) {
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
		const res = [] as TeamSpeakChannel[];
		for (const chn of this.channels) {
			if (chn.pid == id) res.push(chn);
		}
		return res;
	}

	// returns if there are any users in the channel tree below
	GetAnyTreeUsers(cid: string): boolean {
		if (this.GetChannelUser(cid, false).length > 0) return true;
		const chns = this.GetChannelsBymain(cid);
		for (const chn of chns) {
			if (this.GetAnyTreeUsers(chn.cid)) return true;
		}
		return false;
	}
}
