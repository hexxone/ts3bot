"use strict";

//
// Copyright (c) 2019 D.Thiele All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

// Every language-related string / user-message
const myObject = {
	id: 1000,
	langCode: "Eng",
	langName: "English",
	langFlag: "🇺🇸",
	langText: "Language set to english.",
	langNotFound: "Language not found.",
	langCurrent: "Current language: English.",

	invalidName:
		"Invalid name. The name must not contain spaces or special characters.",
	invalidFormatSrv:
		"Invalid Format. Use: '<address>|<query_port>|<vserver_id>'",
	invalidFormatAcc: "Invalid Format. Use: '<query_user>|<query_passwd>'",
	noInstSelected: "No server selected.",
	notLinked: "There is no server linked to this group.",
	notAllowed: "You are not allowed to do this.",
	useInGroup: "Use this command in a group with a linked server.",
	errorPrefix: "Unexpected Error: ",
	botDisconnected: "Bot got disconnected: ",
	channelLeave: "left bot channel.",
	channelJoin: "entered bot channel.",
	channelSwitch: "switched to channel:",
	notConnected: "Error: Bot is not connected.",
	userOnline: " users:",
	connectError: "Couldn't connect after <attempts> attempts. Last error: ",
	replyError: "Couldn't execute command.",

	optionOn: "On",
	optionOff: "Off",

	stateIdle: "Idle",
	stateConnecting: "Connecting",
	stateConnected: "Connected",
	stateError: "Disconnected (Error)",

	availableDev: "for developer",
	availableChat: "for users only",
	availableGroup: "for groups only",
	availableAll: "for users and groups",

	groupJoin: " joined the group.",
	groupLeave: " left the group.",

	spamStart1:
		"Spam protection triggered. Your messages will be ignored for: <time> minutes.",
	spamStart2:
		"Spam protection triggered.\r\nSince the bot couldnt contact you privately, you receive this info here:\r\nYour messages will be ignored for: <time> minutes.",
	spamEnd:
		"You are no longer ignored due to Spam. Next time you will be ignored for: <time> minutes.",

	spamIgnoreTrigger:
		"Spam protection triggered. Your messages will be ignored for: ",
	spamIgnoreRevoke:
		"You are no longer ignored due to Spam. Next time you will be ignored for: ",
	spamTimeUnit: " minutes.",
	noAgreement:
		"Please read and agree to the Terms of Service (using /tos) before adding an server.",
	addInfo:
		"You will need the following information:<code>\r\n- server address\r\n- query port\r\n- vserver ID\r\n- a query account</code>\r\nTo begin, tell me how you want to call the server (e.g.: jeff)",
	addLimit:
		"Sorry, but you have reached the limit of 5 servers per User. You can always /delete or alter unneeded ones but if you really need more, contact me using /devmessage",
	linkLimit:
		"Sorry, but you have reached the limit of 20 linked groups per User. You can always /unlink or edit unneeded ones but if you really need more, contact me using /devmessage",
	admin4allOn: "Everbody is now an Admin... what have you done?",
	admin4allOff: "Revoked Admin privileges.",
	availableCommands: "Available commands:",
	groupNotLinked:
		"This group is not linked to a TS3 server. " +
		"Use /add and /link in bot-chat. ",
	conConnect: "Connecting. This may sometimes take a while...",
	conConnecting: "Bot is still connecting. To cancel use /disconnect",
	conConnected: "Bot is still connected. Use /reconnect instead.",
	delConfirm:
		"Deleting a server will unlink all associated groups.\r\nIf you are sure type exactly the following:\r\n\r\n",
	delConfirmStr: "Yes, delete ",
	devWait:
		"You will have to wait for an answer before sending another message.",
	devSend: "Alright :) tell me what you want to.",
	disconnect: "Disconnecting...",
	faqText:
		"TS3Bot FAQ:\r\nYou can create a query account by connecting to your TS3 server, then click 'Toolbar > Extras > ServerQuery Login' and enter a name.\r\n" +
		"The bots needs following TS3 permissions to work properly:\r\n" +
		" - b_virtualserver_info_view\r\n - b_virtualserver_connectioninfo_view\r\n - b_virtualserver_channel_list\r\n" +
		" - b_virtualserver_client_list\r\n - b_virtualserver_notify_register\r\n - b_virtualserver_notify_unregister\r\n" +
		"The username and channel information gets only updated every 2 minutes.\r\n" +
		"This bot is written in nodejs.\r\n" +
		"Lines of Code: <sloc>",
	helpText:
		"TS3Bot Help:\r\nThis bot provides an interface for linking a TeamSpeak 3 Server" +
		" to Telegram (specific Groups) for cross-chatting and seeing online users.\r\nThe TS3-Connection is established" +
		" using the official Query API and therefore requires an account.Before using the Bot, please accept the /tos. You can add a new Server using: /add\r\n" +
		" The menu should guide you, but if you encounter errors you should read the /faq and in urgent matters contact me using /devmessage",
	tosText:
		"TS3Bot TOS (Terms of Service):\r\nThe bot is intended as a fun and educational project by and for me" +
		" and I am not taking responsibility for any damage it may cause to you or any other party. Since this is a free service," +
		" there is no guarantee for it to stay online or running. You are forbidden to tamper with the bot and associated " +
		" systems in terms of stress-,performance- or security-testing. These things might be considered a DDoS and will be prosecuted by the hoster." +
		" Stored data is encrypted using RSA128 and only used to keep data between restarts.",
	tosAgree: "To agree, please Type exactly: '<tos_string>'",
	tosString: "I agree",
	ignorebots: "Other TS3 query clients will be ignored.",
	unignorebots: "Other TS3 query clients won't be ignored.",
	addLink: "Now please tell me the name for the new link.",
	accountSet: "Account details set.",
	accBotName: " Next tell me a name for the Bot on your Server.",
	channelSet: "Channel name set.",
	channelComplete:
		" The Setup is complete. You can now:\r\n/link the Server to a group\r\n/connect the bot\r\nor edit the settings\r\n(see /commands)",
	channelNameErr: "Error: The name requires between 2 and 32 chars.",
	tosAccept: "Thanks :)",
	tosReject: ":(",
	addedServer:
		"Server created. Now tell me the server address in the following format:\r\n'<ip_or_host>|<query_port>|<ts3_vserver_id>'.",
	nameInUse: "This name is already in use.",
	linkDestroyed: "Deep-link '<link>' was destroyed.",
	linkingDestroyed: "Group linking '<linking>' was destroyed.",
	serverUnlinked: "Server was unlinked from this group.",
	serverDeleted: "Server deleted.",
	deleteError: "Error. Input is case-sensitive. Try again or /cancel",
	devSent:
		"The message was delivered. I will look into it and try to contact you.",
	devError: "Please use between 10 and 500 characters. Current: ",
	linkGroup: "Ok, the bot can now be added to a group using this link:",
	nameError: "The name must not contain spaces or special characters.",
	serverSelected: "Server selected: ",
	serverNotFound: "Server doesn't exist.",
	setName: "Bot-name set.",
	setNameFirst:
		" Now please tell me the exact name of the channel the bot should join.",
	setServer: "Server address set.",
	setServerFirst:
		" Now please tell me the account details in the following format:\r\n'<query_user>|<query_password>'.",
	linkingNotFound: "Linking doesn't exist.",
	groupAlreadyLinked: "This group is already linked to a server.",
	groupLinked: "TS3 server was successfully linked to this group",
	invalidLink: "Error: deeplinking key invalid.",
	startChat:
		"Hi! This bot can link your TeamSpeak3 Server to one or more Telegram group(s).",
	spamCheck: "Spam checking set to: ",
	silentMode: "Silent mode set to: ",
	serverNameHidden: "Server name will be hidden in Telegram.",
	serverNameShown: "Server name will be shown in Telegram.",
	groupNameHidden: "Group name will be hidden in TeamSpeak.",
	groupNameShown: "Group name will be hidden in TeamSpeak.",
	shareMediaOn: "Shared group media will be available in TS3.",
	shareMediaOff: "Shared group media won't be available in TS3.",
	usage: "Usage: ",
	setServerAddress:
		"Ok, please tell me the server address in format '<address>|<query_port>|<ts3_vserver_id>'.",
	setBotName:
		"Ok, please tell me how the bot should call itself on your server.",
	setChatMode: "Chat mode set to: ",
	setChannelDepth: "Channel-depth set to: ",
	setChannelName:
		"Ok, please tell me the name of the channel the bot should join.",
	setAccountDetails:
		"Ok, please tell me the account details in format '<query_user>|<query_passwd>'.",
	selectServer:
		"Tap or write the name of the server you want to edit / select.",
	serverReconnecting:
		"Reconnecting.. this may sometimes take a while (for errors see private chat)",
	setMoveNotifications: "Client move notifications set to: ",
	setJoinNotifications: "Client join notifications set to: ",
	manageHeader: "Servers with linked Groups:<code>",
	manageSelected: "(Selected)",
	manageFooter: "/unlink [link_name] to delete.",
	enableAutoConnect: "Bot will automatically (re)connect.",
	disableAutoConnect: "Bot won't automatically (re)connect.",
	noUsersOnline: "No users online.",
	autoConnecting: "Auto-connecting. One moment please...",
	leftServer: "left the server.",
	joinedServer: "joined the server.",
	botConnected:
		"</b> is now connected.\r\n<b><users> User(s)</b> and <b><bots> Bot(s)</b> online.",
	botChannelMsg: "",
	liveTreeFormat: "LiveTree\r\n<code><tree></code>\r\nChanged: <time>",
	liveTreeError: " ⚠️",
	liveTreeStop: "LiveTree stopped and removed.",

	menu00: "TS3Bot menu:",
	menu01: "\r\nGroup is linked.",
	menu02: "\r\nGroup is not linked.",
	menu03: "\r\nYour servers:     ",
	menu04: "\r\nYour linkings:    ",
	menu05: "\r\nSelected server:  ",
	menu06: "\r\nNo Server selected.",

	info00: "Group & Server Info:  ",
	info01: "\r\nowner:            ",
	info02: "\r\nchanneldepth:     ",
	info03: "\r\nother groups:     ",

	info10: "Selected Server Info: ",
	info11: "\r\nlabel:            ",
	info12: "\r\nlinked groups:    ",

	info20: "\r\nstatus:           ",
	info21: "\r\nserver name:      ",
	info22: "\r\nplatform:         ",
	info23: "\r\nversion:          ",
	info24: "\r\nuser:             ",
	info25: "\r\nchannel:          ",

	settings00: "Group & Server Settings:",
	settings01: "\r\nadmin 4 all:  ",
	settings02: "\r\nchat mode:    ",
	settings03: "\r\nshare media:  ",
	settings04: "\r\nshow group:   ",
	settings05: "\r\nshow server:  ",
	settings06: "\r\nignore bots:  ",
	settings07: "\r\nsilent:       ",
	settings08: "\r\nspam check:   ",
	settings09: "\r\nnotify join:  ",
	settings10: "\r\nnotify move:  ",

	settings20: "Selected Server Settings:",
	settings21: "\r\nlabel:          ",
	settings22: "\r\nserver address: ",
	settings23: "\r\nquery port:     ",
	settings24: "\r\nserver ID:      ",
	settings25: "\r\nquery user:     ",
	settings26: "\r\nquery pass:     ",
	settings27: "\r\nclient name:    ",
	settings28: "\r\nchannel name:   ",
	settings29: "\r\nchanneldepth:   ",
	settings30: "\r\nauto connect:   ",

	stats01: "\r\nlast restart:      ",
	stats02: "\r\nreceived messages: ",
	stats03: "\r\nknown users:       ",
	stats04: "\r\nknown groups:      ",
	stats05: "\r\ninstances:         ",
	stats06: "\r\nlinked groups:     ",
	stats07: "\r\nglobal ts3 users:  ",
	stats08: "\r\nTS3bot ram usage:  ",

	actionCommand: "Invalid response (Commands are not allowed).",
	actionCancel: "Action canceled: ",
	actionNoCancel: "Nothing to cancel ¯\\_(ツ)_/¯",

	pmDisabled: "PM disabled.",
	pmEnabled: "PM enabled. (Test feature!)",

	commandsGroup: "* = Needs Admin Permission\r\n# = Needs linked Server\r\n",
	commandsChat: "~ = Needs selected Server\r\n",
	commandForbidden: "You are not allowed to use this command.",
	commandNotLinked:
		"There is no server linked to this group.\r\nTo do so: /add a server and /link it.",
	commandErrChat1: "This command is meant for bot-chat only.",
	commandErrChat2: "This command is meant for group-chat only.",
	commandNoSelect: "Please /select a server first.",
	commandNoAdded: "Please /add a server first.",
	commandNoTOS: "Please accept the /tos and /add a server first.",
	commandResult: "Command search matches for '<command>':",
	commandNotFound: "No command matching '<command>' found.",
	commandCommand:
		"\r\n<code>Command:      [usage]" +
		"\r\nDescription:  [desc]" +
		"\r\nAvailable:    [available]</code>",
	commandsDetail:
		"\r\nFor details enter: <code>/commands [command_name]</code>",
	commandMax: "5 entries shown at max.",

	cmd_addServer: "Add server",
	cmd_admin4all: "admin 4 all",
	cmd_cancel: "Cancel action",
	cmd_commands: "All commands",
	cmd_connect: "Connect",
	cmd_debug: "Debug Setting",
	cmd_delete: "Delete server and linkings",
	cmd_devmessage: "Developer message",
	cmd_disconnect: "Disconnect",
	cmd_faq: "FAQ",
	cmd_help: "Help",
	cmd_ignorebots: "Ignore other bots",
	cmd_lang: "🇺🇸 / 🇩🇪",
	cmd_link: "Link to a group",
	cmd_livetree: "Server live view",
	cmd_manage: "Manage",
	cmd_menu: "Menu",
	cmd_notifyjoin: "Notify on TS3 join",
	cmd_pm: "Personal message",
	cmd_reconnect: "Reconnect",
	cmd_sample: "sample",
	cmd_select: "Select a server",
	cmd_setaccount: "query account details",
	cmd_setchannel: "TS3 channel name",
	cmd_setchanneldepth: "channel output depth",
	cmd_setchatmode: "TS3 chat mode",
	cmd_setname: "TS3 display name",
	cmd_setserver: "TS3 server address",
	cmd_settings: "Settings",
	cmd_showgroup: "Show group name in TS3?",
	cmd_showserver: "Show server name in Telegram?",
	cmd_silent: "silent messages?",
	cmd_spamcheck: "spam check",
	cmd_start: "Start",
	cmd_stats: "Stats",
	cmd_susers: "Short User list",
	cmd_tos: "Terms of Service",
	cmd_unlink: "Unlink a server from a group",
	cmd_users: "User list",

	cmd_whinfo: "Webhook Info",
	cmd_reload: "Reload modules & languages",
	cmd_rstdev: "Reset a dev-msg-sent-status of a user",
	cmd_loaddata: "Load data",
	cmd_savedata: "Store data",
	cmd_lol: "idk",
};

module.exports = myObject;