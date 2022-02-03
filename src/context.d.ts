import { Telegraf } from "telegraf";
import { Message, User, UserFromGetMe } from "typegram";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

import { TextMessage } from "ts3-nodejs-library/lib/types/Events";

import * as UHelpr from "./object/user";
import { GroupLinking } from "./object/grouplinking";
import { Instance } from "./object/instance";

import { AntiSpam } from "./class/antispam";
import { FileProxy } from "./class/fileproxy";
import { CmdAvailable } from "./class/utils";

import EN_MSG from "./msg/msg_eng";

export declare type TS3BotMsgs = typeof EN_MSG;

export declare type TS3BotCtx = {
	startDate: Date;

	//
	actionsPath: string;
	commandsPath: string;
	languagesPath: string;

	actions: TS3BotAction[];
	commands: TS3BotCmd[];
	languages: TS3BotMsgs[];

	users: UHelpr.User[];
	instances: Instance[];
	linkings: GroupLinking[];

	fileMappings: any;
	announces: any;

	deeplinking: Map<string, GroupLinking>;
	groupnames: Map<number, string>;

	slocCount: number;
	receivedMessages: number;

	bot: Telegraf;
	antispam: AntiSpam;
	fileProxyServer: FileProxy;

	me: UserFromGetMe;

	settings: TS3BotConfig;

	sendNewMessage(chatId: number, text: string, options?: ExtraReplyMessage, noDelete?: boolean): Promise<Message.TextMessage | undefined>;
};

// Settings
// @see "config.ts"
export declare type TS3BotConfig = {
	defaultLanguage: string;

	telegram_bot_token: string;
	developer_id: number;
	debug: boolean;

	useWebHook: boolean;
	webHookAddr: string;
	webHookPort: number;

	webKey: string;
	webCert: string;
	webHookCustomCertificate: boolean;

	useFileProxy: boolean;
	fileProxyPort: number;
	fileProxyAddr: string;

	announceID: number;
	announceText: string;
};

export declare type MessageCtx = {
	chatId: number;
	isGroup: boolean;
	isReply: boolean;

	groupLinking: GroupLinking;
	sender: UHelpr.User;
	opt: ExtraReplyMessage & { reply_markup: InlineKeyboardMarkup | ReplyKeyboardMarkup };
	cmd: string;

	// translations
	groupMessages: TS3BotMsgs;
	senderMessages: TS3BotMsgs;

	msg: Message;
	text: string;
	args: string[];
	senderInstances: Instance[];
	senderSelectedInstance: Instance;
	senderLinkings: GroupLinking[];

	respondChat(txt: string, opt?: ExtraReplyMessage, noDel?: boolean): Promise<Message.TextMessage | undefined>;
};

export declare type TS3BotCmd = {
	id: number; // the id is used for inline commands and has to be unique !
	hidden: boolean; // dont show this command in the /commands list
	command: string[]; // the triggers for this command to be called
	available: CmdAvailable;
	groupperm: boolean; // group permission, if(available=2|3) and set true, command can only be used by admin
	needslinking: boolean; // the command requires the group to have a linked instance (available 2|3)
	needsselected: boolean; // the command requires the sender to have an instance selected (available 1|3)
	usage: string; // command usage (including arguments)
	description: string; // language bundle description has to be unique aswell to be found by the inline keyboard
	callback: (main: TS3BotCtx, ctx: MessageCtx) => void; // executable command
};

export declare type TS3BotAction = {
	id: number; // the id is used for inline actions and has to be unique !
	action: string[]; // the triggers for this action to be called
	callback: (main: TS3BotCtx, ctx: MessageCtx) => void; // executable action
};
