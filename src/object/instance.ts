"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { ClientDisconnectEvent, TeamSpeak, TeamSpeakClient, TextMessageTargetMode } from "ts3-nodejs-library";

import { ServerInfo } from "ts3-nodejs-library/lib/types/ResponseTypes";
import { ClientMoved } from "ts3-nodejs-library/lib/types/Events";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

import { TS3Ctx } from "../context";

import Utils from "../class/utils";

import { IUtils } from "./iutils";
import { GroupLinking } from "./grouplinking";

const CONNECT_TRIES = 3;
const CONNECT_WAIT = 5000;
const PING_INTERVAL = 30000; // 30 seconds

// represents a ts3 connection
export class Instance extends IUtils {
	main: TS3Ctx;
	id: any;
	name: string;

	// persistent values / settings

	groups: GroupLinking[];
	trees: number[];

	qname: string;
	qpass: string;
	addr: string;
	qport: number;

	serverPort: number;
	clientname: string;
	channelname: string;
	channeldepth: number;
	autoconnect: boolean;

	greetmode: number;
	greetmsg: string;

	// runtime values

	bot: TeamSpeak;
	serverinfo: ServerInfo; // info
	whoami: TeamSpeakClient; // own id

	channels: any;
	channelid: any; // own channel id

	connectionState: number;
	connectionErr: string;
	connectTry: number;
	connectCallback: () => void;

	constructor(main: TS3Ctx, id, name) {
		super();

		this.main = main;
		this.id = id;
		this.name = name;

		this.bot = null as any;
		this.whoami = null as any;

		this.connectionState = 0; // 0=disconnected | 1=connecting | 2=connected | 3=disconnected(err)
		this.connectionErr = "";
		this.connectTry = 0;
		this.connectCallback = () => {};

		this.serverinfo = {} as any;

		// data to be exported when saving
		this.groups = [];
		this.trees = [];

		this.qname = "";
		this.qpass = "";
		this.addr = "";
		this.qport = 10011;
		this.serverPort = 9987;
		this.clientname = "";
		this.channelname = "";
		this.channeldepth = 0;
		this.autoconnect = false;

		// TODO utilize greetmode & create setting command?
		this.greetmode = 0;
		this.greetmsg = "Welcome to the Server. I am the Telegram to TS3 bot.";
	}

	owner() {
		return Utils.getUser({ id: this.id });
	}

	Export() {
		return {
			groups: this.groups,
			trees: this.trees,
			id: this.id,
			name: this.name,
			qname: this.qname,
			qpass: this.qpass,
			addr: this.addr,
			qport: this.qport,
			sid: this.serverPort,
			clientname: this.clientname,
			channelname: this.channelname,
			channeldepth: this.channeldepth,
			autoconnect: this.autoconnect,
			greetmode: this.greetmode,
			greetmsg: this.greetmsg,
		};
	}

	Connect(callback?, respond?) {
		// connecting state update
		this.connectionState = 1;
		this.connectTry++;
		// ts3 bot settings
		let settings = {
			name: this.clientname,
			host: this.addr,
			port: this.qport,
			sid: this.serverPort,
		};
		//console.log('settings: ' + JSON.stringify(settings));
		this.bot = new TeamSpeak({
			host: this.addr,
			queryport: this.qport,
			username: this.qname,
			password: this.qpass,
			nickname: this.clientname,
			serverport: this.serverPort,
		});

		console.log("Connecting...");

		// Register Events handlers

		this.bot.on("error", (err) => {
			console.log(this.name + " | TS3Error: ", err);
		});

		// Bot was Disconnected
		this.bot.on("close", () => this._onClose());

		// Client joined the server
		this.bot.on("clientconnect", (data) => this._onClientEnterView(data));

		// Client left the server
		this.bot.on("clientdisconnect", (data) => this._onClientLeftView(data));

		// Client switched a channel, get user info and update in this.users
		this.bot.on("clientmoved", (data) => this._onClientMoved(data));

		// Message received
		this.bot.on("textmessage", (data) => this._onTextMessage(data));

		// Start the login Process
		// if Permissions fail, they will return an error message to the instance owner:
		// 23	b_virtualserver_info_view	        Retrieve virtual server information
		// 24	b_virtualserver_connectioninfo_view	Retrieve virtual server connection information
		// 25	b_virtualserver_channel_list	    List channels on a virtual server
		// 27	b_virtualserver_client_list	        List clients online on a virtual server
		// 43	b_virtualserver_notify_register	    Register for server notifications
		// 44	b_virtualserver_notify_unregister	Unregister from server notifications
		this.bot
			.connect()
			.then(async (ts3) => {
				// Get own client id (for moving & ignoring own messages)
				const whoami = await ts3.whoami();
				this.whoami = (await ts3.getClientById(whoami.clientId)) as TeamSpeakClient;
				// get server info like name, users / slots
				this.serverinfo = await ts3.serverInfo();
			})
			// get the user list once (will then be updated by events)
			.then(() => this._updateClientList())
			// get the channel list and try to move to the given channel
			.then(() => this._updateChannelList())
			.then(() => {
				if (this.channels.length < 1) throw "No channels found (permission?).";
				// if a channel is set, try to find it & move to it
				if (this.channelname !== "") {
					// search all channels for the one with our desired name and get its id
					let myChannel = this.GetChannelByName(this.channelname);
					//console.log(this.name + ' | Found Channel: ' + myChannel);
					if (myChannel === null) throw "Target channel was not found (case sensitive).";
					this.channelid = myChannel.cid;
					// Move the bot to desired channel
					return this.bot.clientMove(this.whoami, this.channelid);
				}
			})
			// Successfully connected, notify groups / ts3 and start keepalive
			.then(() => {
				let tcnt = this.GetUserCount(true);
				let bcnt = this.users.length - tcnt;
				let busr = this.main.me.username;
				// send ts3 msg
				this.SendChannelMessage("Hi! [URL=https://t.me/" + busr + "]" + busr + "[/URL] is now active.");
				// send message for each group & language seperately
				for (let grp of this.groups) {
					let lnk = Utils.getGroupLinking(grp);
					if (!lnk) continue;
					// build message
					let msgs = Utils.getLanguageMessages(lnk.language);
					let tmpmsg = "<b>" + busr + msgs.botConnected.replace("<users>", tcnt).replace("<bots>", bcnt);
					lnk.NotifyTelegram(this.serverinfo.virtualserverName, tmpmsg);
				}
				// send message to owner
				let owner = Utils.getUser({ id: this.id });
				let msgs = Utils.getLanguageMessages(owner.language);
				let tmpmsg = "<b>" + busr + msgs.botConnected.replace("<users>", tcnt).replace("<bots>", bcnt);
				let opt = {
					parse_mode: "HTML",
					reply_markup: {
						inline_keyboard: [[Utils.getCmdBtn("menu", msgs)]],
					},
				} as ExtraReplyMessage;
				// 'respond' if possible
				// TODO: this might prevent the owner of getting a notification
				if (respond) respond(tmpmsg, opt);
				else this.main.sendNewMessage(this.id, tmpmsg, opt);
				// start ping to prevent timeout
				this.connectionState = 2;
				this.RunPing(this);
				// we dont want any of the following calls to maybe throw an error
				// due to an deleted message or some shit and fail our connection.
				// TODO test
				try {
					// run callback
					if (callback) callback();
					// trigger tree update
					this.UpdateLiveTrees();
				} catch (e) {
					console.log("Connect finalize error: ", e);
				}
			})
			// We have an error somewhere, inform the owner
			.catch((err) => {
				this.connectionState = 3;
				this.connectionErr = JSON.stringify(err);
				console.log("TS3 con err: " + this.connectionErr);
				this.Disconnect(this.connectTry < CONNECT_TRIES, true); // disconnect with on error trigger
			});
	}

	_onClose() {
		this.main.handleEx(() => {
			console.log(this.name + " | Disconnected.");
			let msgs = Utils.getLanguageMessages(this.owner().language);
			this.main.sendNewMessage(this.id, msgs.botDisconnected + this.name);
			this.connectionErr = "Connection closed by server.";
			this.Disconnect(this.autoconnect);
		});
	}

	_onClientEnterView(data) {
		this.main.handleEx(() => {
			//console.log('Join data: ' + JSON.stringify(data));
			for (let usr of this.users) if (usr.clid === data.clid) return; // user already connected

			// add object data
			this.users.push(data);
			this.SortUsers();
			// if the client is of type server query, the type will be 1
			let isbot = data.type == 1;
			//console.log(this.name + ' | Join: ',  data)
			// Notify groups by looping all
			for (let gid of this.groups) {
				// get the linking for this group
				let lnk = Utils.getGroupLinking(gid);
				// dont notify for joins ?
				if (!lnk.notifyjoin) continue;
				// ignore query clients in this group ?
				if (isbot && lnk.ignorebots) continue;
				// build message
				let bName = "<b>" + this.fixNameToTelegram(data.nickname) + "</b>";
				let bFlag = isbot ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(data.client_database_id) + "₎ ";
				let msgs = Utils.getLanguageMessages(lnk.language);
				// send Message
				lnk.NotifyTelegram(this.serverinfo.virtualserverName, bName + bFlag + msgs.joinedServer);
			}
			// trigger tree update
			this.UpdateLiveTrees();
		});
	}

	_onClientLeftView(data: ClientDisconnectEvent) {
		this.main.handleEx(() => {
			//console.log('Left data: ' + JSON.stringify(data));
			for (let i = 0; i < this.users.length; i++) {
				let usr = this.users[i];
				if (usr.clid !== data.client?.clid) continue;
				// we wanto to remove this user
				this.users.splice(i, 1);
				// if the client is of type server query, the type will be 1
				let isbot = usr.type == 1;
				//console.log(this.name + ' | Left: ' + usr.nickname);
				// Notify groups by looping all
				for (let gid of this.groups) {
					// get the linking for this group
					let lnk = Utils.getGroupLinking(gid);
					// dont notify for joins ?
					if (!lnk.notifyjoin) continue;
					// ignore query clients in this group ?
					if (isbot && lnk.ignorebots) continue;
					// build message
					let bName = "<b>" + this.fixNameToTelegram(usr.nickname) + "</b>";
					let bFlag = isbot ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(usr.databaseId) + "₎ ";
					let msgs = Utils.getLanguageMessages(lnk.language);
					// send messages
					lnk.NotifyTelegram(this.serverinfo.virtualserverName, bName + bFlag + msgs.leftServer);
				}
			}
			// trigger tree update
			this.UpdateLiveTrees();
		});
	}

	_onClientMoved(data: ClientMoved) {
		this.main.handleEx(() => {
			// loop all clients
			this.users.forEach((usr) => {
				if (usr.clid !== data.client.clid) return; // wrong client
				if (usr.cid == data.channel.cid) return; // Client move ignored (already in target channel)

				// if the client is a bot/server-query, the type will be 1
				let isbot = usr.type == 1;
				let oldChannel = usr.cid;
				(usr as any).cid = data.channel.cid;
				//console.log(this.name + ' | Client moved: ' + usr.nickname);
				// get target channel
				for (let chan of this.channels) {
					if (chan.cid != data.channel.cid) continue;
					// notify all groups
					for (let grp of this.groups) {
						let lnk = Utils.getGroupLinking(grp);
						if (!lnk) continue;
						// ignore query clients in this group ?
						if (isbot && lnk.ignorebots) continue;
						// build message
						let msgs = Utils.getLanguageMessages(lnk.language);
						let srvname = this.serverinfo.virtualserverName;
						let bName = "<b>" + this.fixNameToTelegram(usr.nickname) + "</b>";
						let bFlag = isbot ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(usr.databaseId) + "₎ ";
						// notify group
						switch (lnk.notifymove) {
							// notify channel
							case 1:
								let send = null;
								// user left our channel
								if (this.channelid == oldChannel) send = msgs.channelLeave;
								// user joined our channel
								else if (this.channelid == data.channel.cid) send = msgs.channelJoin;
								// actual send
								if (send != null) lnk.NotifyTelegram(srvname, bName + bFlag + send + " [" + this.GetChannelUser(this.channelid, lnk.ignorebots).length + "]");
								break;
							// notify global
							case 2:
								lnk.NotifyTelegram(srvname, bName + bFlag + msgs.channelSwitch + " <b>" + chan.name + "</b> [" + this.GetChannelUser(data.channel.cid, lnk.ignorebots).length + "]");
								break;
						}
					}
				}
				// trigger tree update
				this.UpdateLiveTrees();
			});
		});
	}

	_onTextMessage(data) {
		this.main.handleEx(() => {
			// ignore messages by the bot itself
			if (this.whoami != null && data.invokerid == this.whoami) return;
			// Get message
			let msgText = this.unescapeStr(data.msg);
			// is private bot message?
			if (data.targetmode === 1) {
			}
			// Notify groups
			else this.NotifyGroups(data.targetmode, "<b>" + this.fixNameToTelegram(data.invokername) + "</b> : " + this.fixUrlToTelegram(msgText));
		});
	}

	// clientlist -uid -away -voice -times
	_updateClientList() {
		return this.bot.clientList().then((cl) => {
			this.users = cl;
			return cl;
		});
	}

	// channellist -topic -flags -voice
	_updateChannelList() {
		return this.bot.channelList().then((cl) => {
			this.channels = cl;
			return cl;
		});
	}

	// Disconnects the Bot from the server, no matter which state
	Disconnect(recon?, onerror?) {
		if (this.bot)
			this.bot.logout().catch((err) => {
				console.log("quit error! server: " + this.name + ", err: " + JSON.stringify(err));
			});
		this.bot = null as any;
		this.connectionState = 0;
		if (recon) {
			this.connectionState = 1;
			setTimeout(() => this.Connect(), CONNECT_WAIT);
		} else if (onerror) {
			this.UpdateLiveTrees(true);
			this.connectionState = 3;
			let msgs = Utils.getLanguageMessages(this.owner().language);
			this.main.sendNewMessage(this.id, msgs.connectError.replace("<attempts>", this.connectTry) + this.connectionErr);
		}
	}

	/*
	 *  OLD User formatting (TODO optimize?)
	 */

	// Returns the currently online users grouped by channels as String
	GetUserString(language, ignorebots, callback) {
		this.WrapAutoConnect(language, callback, () => {
			let msgs = Utils.getLanguageMessages(language);
			let userStruct = {};
			// Add users to array grouped by channel
			for (let usr of this.users) {
				// if this is a query client, ignore him
				if (usr.type == 1 && ignorebots) continue;
				// if array not defined, do it
				if (!userStruct[usr.cid]) userStruct[usr.cid] = [];
				// push user to respective 'channel'-array
				userStruct[usr.cid].push(usr);
			}
			//console.log(this.name + ' | getting users: ' + JSON.stringify(userStruct));
			let result = this.GetUserCount(ignorebots) + " / " + this.serverinfo.virtualserver_maxclients + msgs.userOnline + " <code>";
			// Loop all channelIds
			for (let cid of Object.keys(userStruct)) {
				// get channel
				let channel = this.GetChannelById(cid);
				if (!channel) continue;
				// Add channelname and users
				let chres = "\r\n( " + this.fixSpacer(channel.name) + " ) [" + userStruct[cid].length + "]";
				for (let usr in userStruct[cid]) {
					let user = userStruct[cid][usr];
					let isbot = user.type == 1;
					if (isbot && ignorebots) continue;
					let bName = this.fixNameToTelegram(user.nickname);
					let bFlag = isbot ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(user.client_database_id) + "₎ ";
					chres += "\r\n - " + bName + bFlag;
				}
				// channeldepth thingy
				for (let i = 0; i < this.channeldepth; i++) {
					let mainCh = this.GetChannelById(channel.pid);
					if (mainCh === null) break;
					chres = "\r\n( " + this.fixSpacer(mainCh.name) + " ) " + chres.replace("\r\n", "\r\n\t");
					channel = mainCh;
				}
				result += chres;
			}
			// hello? no one there?
			if (Object.keys(userStruct).length === 0) {
				result = msgs.noUsersOnline;
			} else result += "</code>";
			// send result
			callback(result);
		});
	}

	// callack is function and takes 1 argument: msg string
	GetSimpleUserString(language, ignorebots, callback) {
		this.WrapAutoConnect(language, callback, () => {
			let msgs = Utils.getLanguageMessages(language);
			let result = this.GetUserCount(ignorebots) + " / " + this.serverinfo.virtualserver_maxclients + msgs.userOnline + " <code>";
			let userStruct = {};
			// Add users to array grouped by channel
			for (let usr of this.users) {
				// if this is a query client, ignore him
				if (usr.type == 1 && ignorebots) continue;
				// Add /Increment user channel count
				if (!userStruct[usr.cid]) userStruct[usr.cid] = 0;
				userStruct[usr.cid]++;
			}
			// Loop all channelIds
			for (let cid of Object.keys(userStruct)) {
				// Add channelname and user count
				let channel = this.GetChannelById(cid);
				result += "\r\n( " + this.fixSpacer(channel.name) + " ) [" + userStruct[cid] + "]";
			}
			callback(result + "</code>");
		});
	}

	/*
	 *  TS3 MESSAGE SEND
	 */

	// Send a Text Message to the Server Chat, visible for anyone
	// URLS need ro be fixed beforehand using Utils.fixUrlToTS3
	SendGlobalMessage(msg) {
		// prep msg
		msg = this.escapeStr(msg);
		if (this.connectionState == 2) {
			this.bot.sendTextMessage(this.channelid, TextMessageTargetMode.SERVER, msg);
		}
		// bot not connected, but autoconnect is active and callback is given
		else if (this.connectionState != 1 && this.autoconnect) {
			this.Connect(() => this.bot.sendTextMessage(this.channelid, TextMessageTargetMode.SERVER, msg));
		}
	}

	// Send a Text Message to the current Bot Channel
	// URLS need ro be fixed beforehand using Utils.fixUrlToTS3
	SendChannelMessage(msg: string) {
		// prep msg
		msg = this.escapeStr(msg);
		if (this.connectionState == 2) {
			this.bot.sendTextMessage(this.channelid, TextMessageTargetMode.CHANNEL, msg);
		}
		// bot not connected, but autoconnect is active and callback is given
		else if (this.connectionState != 1 && this.autoconnect) {
			this.Connect(() => this.bot.sendTextMessage(this.channelid, TextMessageTargetMode.SERVER, msg));
		}
	}

	// Send a Text Message to the given user (case sensitive)
	SendPrivateMessage(user: TeamSpeakClient, msg) {
		if (this.bot != null) {
			msg = Utils.fixUrlToTS3(msg);
			this.bot.sendTextMessage(user.clid, TextMessageTargetMode.CLIENT, msg);
		}
	}

	/*
	 * TELEGARM GROUP NOTIFICATION
	 */

	// send a chatmessage from ts3 to all Telegram groups with the correct channel/chat mode
	NotifyGroups(targetmode, message) {
		for (let gid of this.groups) {
			let gl = Utils.getGroupLinking(gid);
			if (targetmode !== 0 && gl.chatmode != targetmode) continue;
			gl.NotifyTelegram(this.serverinfo.virtualserverName, message);
		}
	}

	// Checks if the desired groupid is already registered
	HasGroup(group) {
		let index = this.groups.indexOf(group);
		let ret = index > -1;
		return ret;
	}

	// Add the given groupid
	AddGroup(group) {
		if (this.HasGroup(group)) return;
		this.groups.push(group);
	}

	// Removes the given groupid
	RemoveGroup(group) {
		let index = this.groups.indexOf(group);
		if (index > -1) this.groups.splice(index, 1);
	}

	/*
	 * LIVETREE AREA
	 */

	// returns the given channeltree including users starting from root channel.
	// optionally bots can be ignored and child channels can be included with recursion.
	GetChannelTree(root, ignorebots, recursive, level, onlyUsrChn) {
		let childr = this.GetChannelsBymain(root);
		let chres = "";
		if (root == 0) {
			chres += this.serverinfo.virtualserverName + " (" + this.GetUserCount(ignorebots) + " / " + this.serverinfo.virtualserver_maxclients + ")";
		} else {
			// get users in channel
			let userr = this.GetChannelUser(root, ignorebots);
			// only channels with users?
			if (!onlyUsrChn || userr.length >= 0 || this.GetAnyTreeUsers(root)) {
				// get channel object, flag & name
				let rootc = this.GetChannelById(root);
				chres += this.getChannelFlag(rootc) + " " + rootc.name;
			}
			// process users
			if (userr.length > 0) {
				chres += " [" + userr.length + "]";
				for (let usr in userr) {
					// get user object & check bot
					let usrr = userr[usr];
					// get user flag, name & id
					chres += "\r\n  " + this.getUserAudioFlag(usrr) + " " + this.fixNameToTelegram(usrr.nickname);
					// get user database-id in small number if not a bot
					if (usrr.type == 0) chres += " ₍" + Utils.getNumberSmallASCII(usrr.databaseId) + "₎";
				}
			}
		}
		// recursive downwards call
		if (root == 0 || recursive) {
			for (let chil in childr) {
				let cmsg = this.GetChannelTree(childr[chil].cid, ignorebots, recursive, level + 1, onlyUsrChn);
				chres += "\r\n" + cmsg.split("\r\n").join("\r\n  ");
			}
		}
		// final spacer processing
		if (level == 0) {
			chres = this.fixSpacers(chres);
			let longest = this.longestRow(chres);
			if (longest > 38) chres = chres.replace("  ", " ");
		}
		// done with this level
		return chres;
	}

	// returns the current server tree and calls the update if its different from the last one sent to chat
	GetServerTree(cobj, callback, isError) {
		let msgs = Utils.getLanguageMessages(cobj.language);
		let currenttree = isError ? null : this.GetChannelTree(0, cobj.ignorebots, true, 0, false);
		let msg = msgs.liveTreeFormat;
		if ((isError && !cobj.lasterror) || !cobj.lasttree || cobj.lasttree != currenttree) {
			if (!isError) cobj.lasttree = currenttree;
			cobj.lasterror = isError;
			msg = msg.replace("<time>", Utils.getTime() + (isError ? msgs.liveTreeError : ""));
			msg = msg.replace("<tree>", cobj.lasttree);
			callback(msg);
		}
	}

	// will try to update the tree in the given chat.
	UpdateLiveTree(tree: number, error?) {
		let cobj = tree > 0 ? Utils.getUser({ id: tree }) : Utils.getGroupLinking(tree);
		if (!cobj || !cobj.language) {
			console.log("Critical: cant find chat object for live tree: " + JSON.stringify([tree, cobj]));
			this.RemoveLiveTree(tree);
			return;
		}

		this.GetServerTree(
			cobj,
			(text) => {
				if (cobj.livetree) {
					console.log("Update tree: " + cobj.livetree);
					this.main.bot.telegram.editMessageText(tree, cobj.livetree, undefined, text);
				} else {
					this.main.bot.telegram.sendMessage(tree, text, { parse_mode: "HTML" }).then((msg) => {
						cobj.livetree = msg.message_id;
						console.log("New tree: " + cobj.livetree);
					});
				}
			},
			error
		);
	}

	// will try to update all livetress for this instance.
	UpdateLiveTrees(error?) {
		for (let lt in this.trees) {
			let tree = this.trees[lt];
			this.UpdateLiveTree(tree, error);
		}
	}

	// will add a new livetree to the chat or force it to update.
	AddLiveTree(chatId: number) {
		let index = this.trees.indexOf(chatId);
		if (index < 0) this.trees.push(chatId);
		// get chat that should contain the tree
		let cobj = chatId > 0 ? Utils.getUser({ id: chatId }) : Utils.getGroupLinking(chatId);
		// reset last tree to force an update now
		cobj.lasttree = undefined;
		// auto connect wrapper
		this.WrapAutoConnect(
			cobj.language,
			(msg) => {
				// respond for livetree autoconnect
				this.main.bot.telegram.sendMessage(chatId, msg, { parse_mode: "HTML" });
				// After connect trigger update
			},
			() => this.UpdateLiveTree(chatId)
		);
	}

	// will remove an existing livetree (delete msg & stop updates)
	RemoveLiveTree(chatId) {
		let index = this.trees.indexOf(chatId);
		if (index > -1) this.trees.splice(index, 1);
		let chatObject = chatId > 0 ? Utils.getUser({ id: chatId }) : Utils.getGroupLinking(chatId);
		if (chatObject.livetree) {
			this.main.bot.telegram.deleteMessage(chatId, chatObject.livetree);
			chatObject.livetree = 0;
			this.main.bot.telegram.sendMessage(chatId, Utils.getLanguageMessages(chatObject.language).liveTreeStop);
		}
	}

	/*
	 *  PING / UPDATER
	 */

	// Function for pinging the server to prevent timeouts
	RunPing(self) {
		if (self.connectionState == 2) {
			//console.log(self.name + ' | Updating Channels & Users...');
			// update channels (e.g channel name change)
			self._updateClientList()
				.then(() => self._updateChannelList())
				.then(() => {
					// trigger tree update, will only fire when change is detected .
					self.UpdateLiveTrees();
					// set next timeout
					setTimeout(() => self.RunPing(self), PING_INTERVAL);
				})
				.catch((err) => {
					self.connectionErr = JSON.stringify(err);
					console.log("Ping Err: " + self.connectionErr);
					if (self.autoconnect) {
						self.connectTry = 0;
						self.Disconnect(true);
					} else self.Disconnect(false, true);
				});
		} else console.log("Ping connectionState != 2 cancel.");
	}

	/*
	 *    HELPER FUNCTIONS
	 */

	// Auto-Connect wrapper
	// will check if the server is currently connected.
	// if not, it will
	WrapAutoConnect(language, respond, connectedCallback, passCondition?) {
		let msgs = Utils.getLanguageMessages(language);
		if (this.connectionState == 2 || passCondition) {
			connectedCallback();
		}
		// bot not connected, but autoconnect is active and callback is given
		else if (this.connectionState != 1 && this.autoconnect) {
			respond(msgs.autoConnecting);
			this.connectTry = 0;
			this.Connect(() => connectedCallback);
		}
		// bot stays not connected
		else respond(msgs.notConnected);
	}
}

// circular reference needs to be loaded after export..
