"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

// represents a bot user
export class User {
	// telegram props

	id: number;
	username: string;
	first_name: string;
	last_name: string;

	language: string;
	last_bot_msg_id: number;

	// bot props

	menu: string;
	selected: string;
	agreement: boolean;

	spams: number;
	banneduntil: any;

	// live tree
	livetree?: number;
	lasttree?: string;
	lasterror?: string;

	constructor(id: number, uname: string, first: string, last: string, lang: string) {
		// always initialize all instance properties
		this.id = id;
		this.username = uname;
		this.first_name = first;
		this.last_name = last;
		this.language = lang;

		// set defaults

		this.menu = "";
		this.selected = "";
		this.agreement = false;

		this.spams = 0;
		this.banneduntil = null;

		this.last_bot_msg_id = -1;
	}

	Export() {
		return {
			id: this.id,
			username: this.username,
			first_name: this.first_name,
			last_name: this.last_name,
			menu: this.menu,
			selected: this.selected,
			agreement: this.agreement,
			spams: this.spams,
			banneduntil: this.banneduntil,
			language: this.language,
			last_bot_msg_id: this.last_bot_msg_id,
			livetree: this.livetree,
			lasttree: this.lasttree,
			lasterror: this.lasterror,
		};
	}

	// Returns the Username
	GetName() {
		if (this.username != null) return "@" + this.username;
		else {
			let n = this.first_name;
			if (this.last_name != null) n += " " + this.last_name;
			return n;
		}
	}
}
