import { Telegraf } from "telegraf";
import { Message, User, UserFromGetMe } from "typegram";

import * as UHelpr from "./class/user";

import { AntiSpam } from "./class/antispam";
import { FileProxy } from "./class/fileproxy";
import { GroupLinking } from "./class/grouplinking";
import { Instance } from "./object/instance";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

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

	actions: any[];
	commands: any[];
	languages: any[];

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

	groupBinding: GroupLinking;
	sender: UHelpr.User;
	opt: ExtraReplyMessage & { reply_markup: InlineKeyboardMarkup | ReplyKeyboardMarkup };
	cmd: string;

	// translations
	groupMessages: any;
	senderMessages: any;
	developer_id: number;

	msg: Message;
	text: string;
	args: string[];
	senderInstances: Instance[];
	senderSelectedInstance: Instance;
	senderLinkings: GroupLinking[];

	respondChat(txt: string, opt?: ExtraReplyMessage, noDel?: boolean): void;
};
