"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { ClientDisconnectEvent, TeamSpeak, TeamSpeakClient, TextMessageTargetMode } from "ts3-nodejs-library";

import { ServerInfo } from "ts3-nodejs-library/lib/types/ResponseTypes";
import { ClientConnect, ClientMoved, TextMessage } from "ts3-nodejs-library/lib/types/Events";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

import { TS3BotCtx } from "../context";

import Utils from "../class/utils";

import { IUtils } from "./iutils";
import ts3utils from "../class/ts3utils";
import TreeHelper from "./treehelper";

const CONNECT_TRIES = 3;
const CONNECT_WAIT = 5000;
const PING_INTERVAL = 30000; // 30 seconds

export enum GreetMode {
	Disabled = 0,
	OnJoin = 1,
	OnConnect = 2,
}

// Query connection-state
export enum QConState {
	Disconnected = 0,
	Connecting = 1,
	Connected = 2,
	Error = 3,
}

// represents a ts3 connection
export class Instance extends IUtils {
	main: TS3BotCtx;
	// Tg-Owner id
	id: any;
	// Given by Owner
	name: string;

	// persistent values / settings

	groups: number[];
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

	// informs ts3-clients about the bot-presence
	greetmode: GreetMode;
	greetmsg: string;

	// runtime values

	treeHelper: TreeHelper;

	bot: TeamSpeak;
	lastPing: Date;
	serverinfo: ServerInfo; // info
	whoami: TeamSpeakClient; // own id

	sentGreetings: TeamSpeakClient[];
	inChannel: TeamSpeakClient[];

	connectionState: QConState;
	connectionErr: string;
	connectTry: number;

	constructor(main: TS3BotCtx, id, name) {
		super();

		this.main = main;
		this.id = id;
		this.name = name;

		this.treeHelper = new TreeHelper(this);

		this.bot = null as any;
		this.lastPing = null as any;
		this.serverinfo = null as any;
		this.whoami = null as any;

		this.connectionState = QConState.Disconnected;
		this.connectionErr = "";
		this.connectTry = 0;

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

		this.greetmode = GreetMode.OnJoin;
		this.greetmsg = "Hi. TS3Bot is active in this channel and will cross-chat messages with Telegram :)";

		this.sentGreetings = [];
		this.inChannel = [];
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
		this.sentGreetings = [];
		this.connectionState = QConState.Connecting;
		this.connectTry++;
		// ts3 bot settings

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
			// Get own client id (for moving & ignoring own messages)
			.then(async (ts3) => {
				const whoami = await ts3.whoami();
				this.whoami = (await ts3.getClientById(whoami.clientId)) as TeamSpeakClient;
			})
			// get server info like name, users / slots
			.then(() => this._updateServerInfo())
			// get the user list once (will then be updated by events)
			.then(() => this._updateClientList())
			// get the channel list and try to move to the given channel
			.then(() => this._updateChannelList())
			.then(() => {
				if (this.channels.length < 1) throw "No channels found (permission?).";
				// if a channel is set, try to find it & move to it
				if (this.channelname !== "") {
					// search all channels for the one with our desired name and get its id
					const myChannel = this.GetChannelByName(this.channelname);
					if (!myChannel) throw "Target channel was not found (case sensitive).";
					this.myChannel = myChannel;
					// get channel users
					myChannel.getClients().then((inChannel) => (this.inChannel = inChannel));
					// Move the bot to desired channel
					return this.bot.clientMove(this.whoami, myChannel.cid);
				}
			})
			// ts3 connecting-part succeeded, notify groups / ts3 and start keepalive
			.then(() => {
				const uCount = this.GetUserCount(true);
				const userCntStr = uCount.toString();
				const botCntStr = (this.users.length - uCount).toString();
				const botUsr = this.main.me.username;
				// send ts3 msg
				this.SendChannelMessage("Hi! [URL=https://t.me/" + botUsr + "]" + botUsr + "[/URL] is now active.");
				// send message for each group & language seperately
				for (const grp of this.groups) {
					const lnk = Utils.getGroupLinking(grp);
					if (!lnk) continue;
					// build message
					const msgs = Utils.getLanguageMessages(lnk.language);
					const tmpmsg = "<b>" + this.serverinfo.virtualserverName + msgs.botConnected.replace("$users$", userCntStr).replace("$bots$", botCntStr);
					lnk.NotifyTelegram(tmpmsg);
				}
				// send message to owner
				const owner = Utils.getUser({ id: this.id });
				const msgs = Utils.getLanguageMessages(owner.language);
				const tmpmsg = "<b>" + this.serverinfo.virtualserverName + msgs.botConnected.replace("$users$", userCntStr).replace("$bots$", botCntStr);
				const opt = {
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
				this.connectionState = QConState.Connected;
				this.RunPing();
				// we dont want any of the following calls to maybe throw an error
				// due to an deleted message or some shit and fail our connection.
				try {
					// run callback
					if (callback) callback();
					// trigger tree update
					this.treeHelper.UpdateAll();
				} catch (e) {
					console.log("Connect finalize error: ", e);
				}
			})
			// We have an error somewhere, inform the owner
			.catch((err) => {
				this.connectionState = QConState.Error;
				this.connectionErr = JSON.stringify(err);
				console.log("TS3 con err: " + this.connectionErr);
				this.Disconnect(this.connectTry < CONNECT_TRIES, true); // disconnect with on error trigger
			});
	}

	_onClose() {
		console.log(this.name + " | Disconnected.");
		const msgs = Utils.getLanguageMessages(this.owner().language);
		this.main.sendNewMessage(this.id, msgs.botDisconnected + this.name);
		this.connectionErr = "Connection closed by server.";
		this.Disconnect(this.autoconnect);
	}

	_onClientEnterView(data: ClientConnect) {
		//console.log('Join data: ' + JSON.stringify(data));
		for (const usr of this.users) if (usr.databaseId === data.client.databaseId) return; // user already connected
		// check to greet user immediately?
		this._checkClientGreet(GreetMode.OnConnect, data.client);
		// add object data
		this.users.push(data.client);
		this.SortUsers();
		// if the client is of type server query, the type will be 1
		const isbot = data.client.type == 1;
		//console.log(this.name + ' | Join: ',  data)
		// Notify groups by looping all
		for (const gid of this.groups) {
			// get the linking for this group
			const lnk = Utils.getGroupLinking(gid);
			// dont notify for joins ?
			if (!lnk.notifyjoin) continue;
			// ignore query clients in this group ?
			if (isbot && lnk.ignorebots) continue;
			// build message
			const bName = "<b>" + ts3utils.fixNameToTelegram(data.client.nickname) + "</b>";
			const bFlag = isbot ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(data.client.databaseId) + "₎ ";
			const msgs = Utils.getLanguageMessages(lnk.language);
			// send Message
			lnk.NotifyTelegram(bName + bFlag + msgs.joinedServer);
		}
		// trigger tree update
		this.treeHelper.UpdateAll();
	}

	_onClientLeftView(data: ClientDisconnectEvent) {
		//console.log('Left data: ' + JSON.stringify(data));
		for (let i = 0; i < this.users.length; i++) {
			const usr = this.users[i];
			if (usr.databaseId !== data.client?.databaseId) continue;
			// we wanto to remove this user
			this.users.splice(i, 1);
			// if the client is of type server query, the type will be 1
			const isbot = usr.type == 1;
			//console.log(this.name + ' | Left: ' + usr.nickname);
			// Notify groups by looping all
			for (const gid of this.groups) {
				// get the linking for this group
				const lnk = Utils.getGroupLinking(gid);
				// dont notify for joins ?
				if (!lnk.notifyjoin) continue;
				// ignore query clients in this group ?
				if (isbot && lnk.ignorebots) continue;
				// build message
				const bName = "<b>" + ts3utils.fixNameToTelegram(usr.nickname) + "</b>";
				const bFlag = isbot ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(usr.databaseId) + "₎ ";
				const msgs = Utils.getLanguageMessages(lnk.language);
				// send messages
				lnk.NotifyTelegram(bName + bFlag + msgs.leftServer);
			}
		}
		// reset greeting
		this.sentGreetings = this.sentGreetings.filter((sg) => sg.databaseId != data.client?.databaseId);
		// trigger tree update
		this.treeHelper.UpdateAll();
	}

	_onClientMoved(data: ClientMoved) {
		const usr = data.client;
		const isbot = usr.type == 1;
		const wasInChannel = this.inChannel.some((c) => c.databaseId == usr.databaseId);
		// notify all groups
		for (const grp of this.groups) {
			const lnk = Utils.getGroupLinking(grp);
			// ignore query clients in this group ?
			if (!lnk || (isbot && lnk.ignorebots)) continue;
			// build message
			const msgs = Utils.getLanguageMessages(lnk.language);
			const bName = "<b>" + ts3utils.fixNameToTelegram(usr.nickname) + "</b>";
			const bFlag = isbot ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(usr.databaseId) + "₎ ";
			// choose options
			let chanUsrId = this.myChannel?.cid;
			let send = "";
			// notify group
			switch (lnk.notifymove) {
				// user joined or left our channel
				case 1:
					if (this.myChannel?.cid === usr.cid) send = msgs.channelJoin;
					else if (wasInChannel) send = msgs.channelLeave;
					break;
				// notify global
				case 2:
					chanUsrId = data.channel.cid;
					send = msgs.channelSwitch + " <b>" + data.channel.name + "</b>";
					break;
			}
			// actual send
			if (send != "") lnk.NotifyTelegram(bName + bFlag + send + " [" + this.GetChannelUser(chanUsrId || "", lnk.ignorebots).length + "]");
		}
		// check to add/greet the user if is in our channel
		if (this.myChannel?.cid === usr.cid) {
			if (!wasInChannel) this.inChannel.push(usr);
			this._checkClientGreet(GreetMode.OnJoin, data.client);
		}
		// remove user from "inChannel" list if he left
		else if (wasInChannel) {
			this.inChannel = this.inChannel.filter((c) => c.databaseId != usr.databaseId);
		}
		// trigger tree update
		this.treeHelper.UpdateAll();
	}

	_onTextMessage(data: TextMessage) {
		// ignore messages by the bot itself
		if (this.whoami != null && data.invoker.databaseId == this.whoami.databaseId) return;
		// is private bot message?
		if (data.targetmode === TextMessageTargetMode.CLIENT) {
			// @TODO something?
		}
		// Notify groups
		else if (data.targetmode === TextMessageTargetMode.CHANNEL) {
			// format user
			const usrName = `<b>${ts3utils.fixNameToTelegram(data.invoker.nickname)}</b>`;
			const usrFlag = ` ₍${Utils.getNumberSmallASCII(data.invoker.databaseId)}₎ `;
			// build notification info msg
			let msg = `<b>${this.serverinfo.virtualserverName}</b> - ${this.myChannel.name}:\r\n`;
			msg += `${usrName + usrFlag} :<code>  ${ts3utils.fixUrlToTelegram(data.msg)}</code>`;
			this.NotifyGroups(msg);
		}
	}

	// serverinfo --all
	_updateServerInfo() {
		return this.bot.serverInfo().then((si) => {
			this.lastPing = new Date();
			this.serverinfo = si;
			return si;
		});
	}

	// channellist -topic -flags -voice
	_updateChannelList() {
		return this.bot.channelList().then((cl) => {
			this.channels = cl;
			return cl;
		});
	}

	// clientlist -uid -away -voice -times
	_updateClientList() {
		return this.bot.clientList().then((cl) => {
			this.users = cl;
			this.SortUsers();
			return cl;
		});
	}

	// check if the client was greeted before, or do it
	_checkClientGreet(mode: GreetMode, client: TeamSpeakClient) {
		if (client.type === 1) return; // dont greet bots lol
		if (this.sentGreetings.some((sg) => sg.databaseId == client.databaseId) || mode != this.greetmode) return;
		this.sentGreetings.push(client);
		this.SendPrivateMessage(client, this.greetmsg);
	}

	// Disconnects the Bot from the server, no matter which state
	Disconnect(recon?, onerror?) {
		if (this.bot)
			this.bot.logout().catch((err) => {
				console.log("quit error! server: " + this.name + ", err: " + JSON.stringify(err));
			});
		this.bot = null as any;
		this.connectionState = QConState.Disconnected;
		if (recon) {
			this.connectionState = QConState.Connecting;
			setTimeout(() => this.Connect(), CONNECT_WAIT);
		} else if (onerror) {
			this.treeHelper.UpdateAll(true);
			this.connectionState = QConState.Error;
			const msgs = Utils.getLanguageMessages(this.owner().language);
			this.main.sendNewMessage(this.id, msgs.connectError.replace("$attempts$", this.connectTry.toString()) + this.connectionErr);
		}
	}

	/*
	 *  OLD User formatting (TODO optimize?)
	 */

	// Returns the currently online users grouped by channels as String
	GetUserString(language, ignorebots, responder: (msg: string) => void) {
		this.WrapAutoConnect(language, responder, () => {
			const msgs = Utils.getLanguageMessages(language);
			const userStruct: { [cid: string]: TeamSpeakClient[] } = {};
			// Add users to array grouped by channel
			for (const usr of this.users) {
				// if this is a query client, ignore him
				if (usr.type == 1 && ignorebots) continue;
				// if array not defined, do it
				if (!userStruct[usr.cid]) userStruct[usr.cid] = [];
				// push user to respective 'channel'-array
				userStruct[usr.cid].push(usr);
			}
			//console.log(this.name + ' | getting users: ' + JSON.stringify(userStruct));
			let result = this.GetUserCount(ignorebots) + " / " + this.serverinfo.virtualserverMaxclients + msgs.userOnline + " <code>";
			// Loop all channelIds
			for (const cid of Object.keys(userStruct)) {
				// get channel
				let channel = this.GetChannelById(cid);
				if (!channel) continue;
				// Add channelname and users
				let chres = "\r\n( " + ts3utils.fixSpacer(channel.name) + " ) [" + userStruct[cid].length + "]";
				for (const user of userStruct[cid]) {
					const isbot = user.type == 1;
					if (isbot && ignorebots) continue;
					const bName = ts3utils.fixNameToTelegram(user.nickname);
					const bFlag = isbot ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(user.databaseId) + "₎ ";
					chres += "\r\n - " + bName + bFlag;
				}
				// channeldepth thingy
				for (let i = 0; i < this.channeldepth; i++) {
					const mainCh = this.GetChannelById(channel.pid);
					if (mainCh === null) break;
					chres = "\r\n( " + ts3utils.fixSpacer(mainCh.name) + " ) " + chres.replace("\r\n", "\r\n\t");
					channel = mainCh;
				}
				result += chres;
			}
			// hello? no one there?
			if (Object.keys(userStruct).length === 0) {
				result = msgs.noUsersOnline;
			} else result += "</code>";
			// send result
			responder(result);
		});
	}

	// callack is function and takes 1 argument: msg string
	GetSimpleUserString(language: string, ignorebots: boolean, responder: (msg: string) => void) {
		this.WrapAutoConnect(language, responder, () => {
			const msgs = Utils.getLanguageMessages(language);
			let result = this.GetUserCount(ignorebots) + " / " + this.serverinfo.virtualserverMaxclients + msgs.userOnline + " <code>";
			const userStruct = {};
			// Add users to array grouped by channel
			for (const usr of this.users) {
				// if this is a query client, ignore him
				if (usr.type == 1 && ignorebots) continue;
				// Add /Increment user channel count
				if (!userStruct[usr.cid]) userStruct[usr.cid] = 0;
				userStruct[usr.cid]++;
			}
			// Loop all channelIds
			for (const cid of Object.keys(userStruct)) {
				// Add channelname and user count
				const channel = this.GetChannelById(cid);
				result += "\r\n( " + ts3utils.fixSpacer(channel.name) + " ) [" + userStruct[cid] + "]";
			}
			responder(result + "</code>");
		});
	}

	/*
	 *  TS3 MESSAGE SEND
	 */

	// Send a Text Message to the Server Chat, visible for anyone
	// URLS need ro be fixed beforehand using Utils.fixUrlToTS3
	SendGlobalMessage(msg: string) {
		// prep msg
		if (this.connectionState == QConState.Connected) {
			this.bot.sendTextMessage("0", TextMessageTargetMode.SERVER, msg);
		}
		// bot not connected, but autoconnect is active and callback is given
		else if (this.connectionState != QConState.Connecting && this.autoconnect) {
			this.Connect(() => this.bot.sendTextMessage("0", TextMessageTargetMode.SERVER, msg));
		}
	}

	// Send a Text Message to the current Bot Channel
	// URLS need ro be fixed beforehand using Utils.fixUrlToTS3
	SendChannelMessage(msg: string) {
		// prep msg
		if (this.connectionState == QConState.Connected) {
			this.bot.sendChannelMessage(this.myChannel, msg);
		}
		// bot not connected, but autoconnect is active and callback is given
		else if (this.connectionState != QConState.Connecting && this.autoconnect) {
			this.Connect(() => this.bot.sendChannelMessage(this.myChannel, msg));
		}
	}

	// Send a Text Message to the given user (case sensitive)
	SendPrivateMessage(user: TeamSpeakClient, msg: string) {
		if (this.connectionState == QConState.Connected) user.message(Utils.fixUrlToTS3(msg));
	}

	/*
	 * TELEGARM GROUP NOTIFICATION
	 */

	// send a chatmessage from ts3 to all Telegram groups with the correct channel/chat mode
	NotifyGroups(message: string) {
		for (const gid of this.groups) {
			const gl = Utils.getGroupLinking(gid);
			if (!gl.channelchat) continue;
			gl.NotifyTelegram(message);
		}
	}

	// Checks if the desired groupid is already registered
	HasGroup(group: number) {
		const index = this.groups.indexOf(group);
		const ret = index > -1;
		return ret;
	}

	// Add the given groupid
	AddGroup(group: number) {
		if (this.HasGroup(group)) return;
		this.groups.push(group);
	}

	// Removes the given groupid
	RemoveGroup(group: number) {
		const index = this.groups.indexOf(group);
		if (index > -1) this.groups.splice(index, 1);
	}

	/*
	 *  PING / UPDATER
	 */

	// Function for updating server infos...
	RunPing() {
		if (this.connectionState != QConState.Connected) {
			console.error("Ping canceled -  Not conencted.");
			return;
		}
		// console.log(self.name + ' | Updating Channels & Users...');
		// update channels (e.g channel name change)
		this._updateClientList()
			.then(() => this._updateChannelList())
			.then(() => {
				// trigger tree update, will only fire when change is detected.
				this.treeHelper.UpdateAll();
				// set next timeout
				setTimeout(() => this.RunPing(), PING_INTERVAL);
			})
			.catch((err) => {
				this.connectionErr = JSON.stringify(err);
				console.error("Ping Err: ", err);
				if (this.autoconnect) {
					this.connectTry = 0;
					this.Disconnect(true);
				} else this.Disconnect(false, true);
			});
	}

	/*
	 *    HELPER FUNCTIONS
	 */

	// Auto-Connect wrapper
	// will check if the server is currently connected.
	// if not, it will
	WrapAutoConnect(language: string, responder: (msg: string) => void, connectedCallback: () => void, passCondition = false) {
		const msgs = Utils.getLanguageMessages(language);
		if (this.connectionState == QConState.Connected || passCondition) {
			connectedCallback();
		}
		// bot not connected, but autoconnect is active and callback is given
		else if (this.connectionState != QConState.Connecting && this.autoconnect) {
			responder(msgs.autoConnecting);
			this.connectTry = 0;
			this.Connect(connectedCallback);
		}
		// bot stays not connected
		else responder(msgs.notConnected);
	}
}
