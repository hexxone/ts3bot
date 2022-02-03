import ts3utils from "../class/ts3utils";
import Utils, { DefaultOpt } from "../class/utils";
import { GroupLinking } from "./grouplinking";

import { Instance } from "./instance";
import { User } from "./user";

/**
LIVETREE Helper - will try to produce an accurate ts3 tree,
including repeating/centered spacers and channel/user symbols.
As the name suggests, it updates live on ts3 query events but
the last "changed" date will be suffixed- in case of errors.
Also the client database-id is suffixed as hint of identity.

Server Name (5 / 32)
==============================
         Entry Hall [1]
    🤖 otherbot
==============================
💬 Business
💬 Retirement home [2]
    🤐 Scam ₍₇₎
    🔇 stinkt ₍₃₎
💬 Movie
💬 Jobcenter
🔒 TopSecret
📍 Bottom Secret [1]
    🤖 TS3Bot
==============================
              AFK
💬 Eat
💬 Sleep [1]
    🔇 hexx.one ₍₁₁₎
==============================
Changed: 2077-12-24 23:17:36

 */
export default class TreeHelper {
	private parent: Instance;

	constructor(parent: Instance) {
		this.parent = parent;
	}

	// returns the given channeltree including users starting from root channel.
	// optionally bots can be ignored and child channels can be included with recursion.
	GetChannelTree(root: string, ignorebots, recursive, level, onlyUsrChn) {
		const prnt = this.parent;
		let childr = prnt.GetChannelsBymain(root);
		let chres = "";
		if (root === "0") {
			chres += prnt.serverinfo.virtualserverName + " (" + prnt.GetUserCount(ignorebots) + " / " + prnt.serverinfo.virtualserverMaxclients + ")";
		} else {
			// get users in channel
			let userr = prnt.GetChannelUser(root, ignorebots);
			// only channels with users?
			if (!onlyUsrChn || userr.length >= 0 || prnt.GetAnyTreeUsers(root)) {
				// get channel object, flag & name
				let rootc = prnt.GetChannelById(root);
				chres += ts3utils.getChannelFlag(rootc) + " " + rootc.name;
			}
			// process users
			if (userr.length > 0) {
				chres += " [" + userr.length + "]";
				for (let usr in userr) {
					// get user object & check bot
					let usrr = userr[usr];
					// get user flag, name & id
					chres += "\r\n  " + ts3utils.getUserAudioFlag(usrr) + " " + ts3utils.fixNameToTelegram(usrr.nickname);
					// get user database-id in small number if not a bot
					if (usrr.type == 0) chres += " ₍" + Utils.getNumberSmallASCII(usrr.databaseId) + "₎";
				}
			}
		}
		// recursive downwards call
		if (root === "0" || recursive) {
			for (let chil in childr) {
				let cmsg = this.GetChannelTree(childr[chil].cid, ignorebots, recursive, level + 1, onlyUsrChn);
				chres += "\r\n" + cmsg.split("\r\n").join("\r\n  ");
			}
		}
		// final spacer processing
		if (level == 0) {
			chres = ts3utils.fixSpacers(chres);
			let longest = ts3utils.longestRow(chres);
			if (longest > 38) chres = chres.replace("  ", " ");
		}
		// done with this level
		return chres;
	}

	// returns the current server tree and calls the update if its different from the last one sent to chat
	GetServerTree(cobj: User | GroupLinking, callback, isError) {
		let msgs = Utils.getLanguageMessages(cobj.language);
		const ignorebots = cobj instanceof GroupLinking && cobj.ignorebots;
		let currenttree = isError ? undefined : this.GetChannelTree("0", ignorebots, true, 0, false);
		let msg = msgs.liveTreeFormat;
		if ((isError && !cobj.lasterror) || !cobj.lasttree || cobj.lasttree != currenttree) {
			if (!isError) cobj.lasttree = currenttree;
			cobj.lasterror = isError;
			msg = msg.replace("$time$", Utils.getTime(new Date()) + (isError ? msgs.liveTreeError : ""));
			msg = msg.replace("$tree$", cobj.lasttree as string);
			callback(msg);
		}
	}

	// will try to update the tree in the given chat.
	UpdateLiveTree(tree: number, error?) {
		let cobj = tree > 0 ? Utils.getUser({ id: tree }) : Utils.getGroupLinking(tree);
		if (!cobj || !cobj.language) {
			console.error("Critical: cant find chat object for live tree: " + JSON.stringify([tree, cobj]));
			this.Remove(tree);
			return;
		}
		const manualRetrigger = cobj.livetree && !cobj.lasttree;
		this.GetServerTree(
			cobj,
			(text) => {
				const tg = this.parent.main.bot.telegram;
				if (cobj.livetree) {
					console.log("Update tree: " + cobj.livetree);
					tg.editMessageText(tree, cobj.livetree, undefined, text, { parse_mode: "HTML" });
					if (manualRetrigger) {
						const msgs = Utils.getLanguageMessages(cobj.language);
						const url = `https://t.me/c/${tree.toString().substring(4)}/${cobj.livetree}`;
						const msg = msgs.liveTreeRefresh.replace("$url$", url);
						tg.sendMessage(tree, msg, Object.assign(DefaultOpt));
					}
				} else {
					tg.sendMessage(tree, text, DefaultOpt).then((msg) => {
						cobj.livetree = msg.message_id;
						console.log("New tree: " + cobj.livetree);
					});
				}
			},
			error
		);
	}

	// will try to update all livetress for this instance.
	UpdateAll(error?) {
		for (let lt of this.parent.trees) this.UpdateLiveTree(lt, error);
	}

	// will add a new livetree to the chat or force it to update.
	Add(chatId: number) {
		const prnt = this.parent;
		let index = prnt.trees.indexOf(chatId);
		if (index < 0) prnt.trees.push(chatId);
		// get chat that should contain the tree
		let cobj = chatId > 0 ? Utils.getUser({ id: chatId }) : Utils.getGroupLinking(chatId);
		// reset last tree to force an update now
		cobj.lasttree = undefined;
		// auto connect wrapper
		prnt.WrapAutoConnect(
			cobj.language,
			(msg) => {
				// respond for livetree autoconnect
				prnt.main.bot.telegram.sendMessage(chatId, msg, DefaultOpt);
				// After connect trigger update
			},
			() => this.UpdateLiveTree(chatId)
		);
	}

	// will remove an existing livetree (delete msg & stop updates)
	Remove(chatId: number) {
		const prnt = this.parent;
		let index = prnt.trees.indexOf(chatId);
		if (index > -1) prnt.trees.splice(index, 1);
		let chatObject = chatId > 0 ? Utils.getUser({ id: chatId }) : Utils.getGroupLinking(chatId);
		if (chatObject.livetree) {
			prnt.main.bot.telegram.deleteMessage(chatId, chatObject.livetree);
			chatObject.livetree = 0;
			prnt.main.bot.telegram.sendMessage(chatId, Utils.getLanguageMessages(chatObject.language).liveTreeStop, DefaultOpt);
		}
	}
}
