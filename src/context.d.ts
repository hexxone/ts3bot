import { Telegraf } from "telegraf";
import { Message, User, UserFromGetMe } from "typegram";

import * as UHelpr from "./object/user";
import { GroupLinking } from "./object/grouplinking";
import { Instance } from "./object/instance";

import { AntiSpam } from "./class/antispam";
import { FileProxy } from "./class/fileproxy";

import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

import EN_MSG from "./msg/msg_eng";
export declare type TS3Msgs = typeof EN_MSG;

export declare type TS3Ctx = {
	defaultLanguage: string;

	startDate: string;

	parseExStr: (ex: any) => string;
	handleEx: (call: () => void) => void;
	telegramErrorHandler: (ex: any) => void;
	exitHandler: (opt: any, err: any) => void;

	//
	actionsPath: string;
	commandsPath: string;
	languagesPath: string;

	actions: BotAction[];
	commands: BotCommand[];
	languages: TS3Msgs[];

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
	run: boolean;

	sendNewMessage(chatId: number, text: string, options?: ExtraReplyMessage, noDelete?: boolean): Promise<Message.TextMessage | undefined>;

	// Settings
	// @see "config.ts"

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
	groupMessages: TS3Msgs;
	senderMessages: TS3Msgs;
	developer_id: number;

	msg: Message;
	text: string;
	args: string[];
	senderInstances: Instance[];
	senderSelectedInstance: Instance;
	senderLinkings: GroupLinking[];

	respondChat(txt: string, opt?: ExtraReplyMessage, noDel?: boolean): void;
};

export declare type BotCommand = {
	id: number; // the id is used for inline commands and has to be unique !
	hidden: boolean; // dont show this command in the /commands list
	command: string[]; // the triggers for this command to be called
	available: 0 | 1 | 2 | 3; // command chat availability, 0 = admin only, 1 = single chat, 2 = group, 3 = chat & group
	groupperm: boolean; // group permission, if(available=2|3) and set true, command can only be used by admin
	needslinking: boolean; // the command requires the group to have a linked instance (available 2|3)
	needsselected: boolean; // the command requires the sender to have an instance selected (available 1|3)
	usage: string; // command usage (including arguments)
	description: string; // language bundle description has to be unique aswell to be found by the inline keyboard
	callback: (main: TS3Ctx, ctx: MessageCtx) => void; // executable command
};

export declare type BotAction = {
	id: number; // the id is used for inline actions and has to be unique !
	action: string[]; // the triggers for this action to be called
	callback: (main: TS3Ctx, ctx: MessageCtx) => void; // executable action
};