"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

import { TS3BotCtx, MessageCtx } from "../context";

// This is a sample command which descibes the different attributes of a Telegram-bot command.
// For a command to work it just needs to be a .js file like this and be located in the 'commands' folder.
// It will then be automatically loaded and reloaded on runtime, which allows hotfixing.

// I'm using the following pattern for various reasons: you can check the commands conditions
// before calling it and save a lot of duplicate code regarding responses.
// Hence, you also know when you could call each command and you can get
// a translated description and usage string for it.

// I've also thought about using regex as command condition, but I figured argument checking
// would include far too much variety and object conditions to really make it worth.
// Regarding the attributes just read on.

export default {
	id: 99, // the id is used for inline commands and has to be unique per command !
	hidden: true, // dont show this command in the /commands list
	command: ["/sample"], // the triggers for this command to be called
	available: 0, // command chat availability, 0 = admin only, 1 = single chat, 2 = group, 3 = chat & group
	groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
	needslinking: false, // the command requires the group to have a linked instance (available 2|3)
	needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
	usage: "/sample", // command usage (including arguments)
	description: "sample", // language bundle description has to be unique aswell to be found by the inline keyboard

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	callback: function (main: TS3BotCtx, ctx: MessageCtx) {
		// This code will be called when the specified command is run and the required conditions are met.
		// fyi: The following arguments will also be used when calling an 'action'
		// the 'main' object will basically contain all runtime-persistent data.
		// THIS INCLUDES ALL DEFINED VALUES FROM CONFIG.JS - THESE ARE NOT LISTED HERE.
		// actions = []            | contains all possible user text-input '/actions'
		// commands = []           | contains all commands (like this one)
		// languages = []          | contains all languages (see '/msgs')
		// users = []              | contains all user objects (see '/class/user.js')
		// instances = []          | contains all user's instances (see 'class/instance.js')
		// linkings = []           | contains all user's group linkings (see 'class/grouplinking.js')
		// fileMappings = {}       | contains the teamspeak3-shared files for the fileproxy
		// announces = {}          | contains chat ids and the last sent announcement
		// deeplinking = Map()     | contains the temporary links to create a grouplinking
		// groupnames = Map()      | contains all groupchat ids and names for easy Notification access
		// bot = {}                | the main bot object, used for sending messages to telegram
		// me = {}                 | contains the bot username, id etc.
		// the 'ctx' object will contain all info regarding the current command, user, servers etc.
		// respondChat = (txt, opt) => {}   | quick way to respond in a chat
		// developer_id = 123               | the defined developer id
		// msg = {}                         | the telegram message object to trigger this command
		// text = ''                        | the sent message text
		// chatId = 123                     | the message chat id
		// sender = {}                      | the message sender
		// isGroup = true                   | command was sent in group
		// senderInstances = []             | the sender's ts3 servers (can be empty)
		// senderSelectedInstance = {}      | the sender's selected instance (can be null)
		// senderLinkings = []              | the sender's grouplinkings
		// senderMessages = {}              | messages in  user's language (for quick response)
		// groupBinding = {}                | if command sent in group and group linked, this will be the link. (Doesnt mean sender has access)
		// groupMessages = {}               | messages in group's language
		// Using all this stuff and some js-magic you should be up and running quick when creating a command.
		// For some more examples just look at other commands.
	},
};
