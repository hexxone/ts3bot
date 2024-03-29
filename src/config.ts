"use strict";

import dotenv from "dotenv";

import { TS3BotConfig } from "./context";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

export default (): TS3BotConfig => {
	// self is the main self of the app to apply settings to.
	const conf = {} as TS3BotConfig;

	// loads ".env" file into process.env variables
	console.log("Loading config from '.env'");
	dotenv.config();

	// bot token from @BotFather in Telegram
	// will be used to encrypt & store the individual bot data
	conf.telegram_bot_token = process.env.BOT_TOKEN || "<TOKEN_ERROR>";

	// Telegram only supports HTTPS connections to WebHooks.
	// Therefore, in order to use the bot with a WebHook, you will need a SSL certificate.
	// If you already setup Cloudflare with SSL for your domain, you usually dont need to do anything.

	// Use Webhook? if set to false, polling is used
	conf.useWebHook = process.env.WEBHOOK == "true" || false;
	// the address the webhook should use and where your server is reachable.
	// dont include the https:// part, as it is added automatically.
	conf.webHookAddr = process.env.WEBHOOK_ADDR || "bot.example.com";
	// Only following Ports are allowed by Telegram: [80,443,8080,8443]
	// Btw cloudflare will only support these aswell
	conf.webHookPort = parseInt(process.env.WEBHOOK_PORT || "443");

	// Alternatively: Telegram supports self-signed certificates since 2015.
	// After generating them, you should also set appropiate access permissions..
	//
	// # Our private certificate will be the following, exported as "key.pem" - dont share this file!
	// on linux: $ openssl genrsa -out key.pem 2048
	//
	// # Our public certificate takes the "private" one as input and will be exported as "crt.pem"
	// on linux: $ openssl req -new -sha256 -key key.pem -out crt.pem
	//
	// private key
	conf.webKey = __dirname + "/app/data/key.pem";
	// public key
	conf.webCert = __dirname + "/app/data/crt.pem";
	// When using self signed certificate (not external SSL), set to true
	conf.webHookCustomCertificate = process.env.CUSTOM_CERT == "true" || false;

	// File Proxy?
	// will allow files shared in Telegram to be downloaded from your TeamSpeak users.
	// Note: this will abviously expose the bot-ip to users.
	conf.useFileProxy = process.env.FILE_PROXY == "true" || false;
	conf.fileProxyPort = parseInt(process.env.FILE_PROXY_PORT || "8080");
	conf.fileProxyAddr = process.env.FILE_PROXY_ADDR || conf.webHookAddr;

	// The Telegram User ID of the Developer (for admin & special commands)
	conf.developer_id = parseInt(process.env.DEVELOPER_ID || "12345678");
	// will send occuring Exceptions to the Developer if possible.
	conf.debug = process.env.DEBUG == "true" || false;

	// the default language the bot will use for new users
	conf.defaultLanguage = process.env.LANGUAGE || "en";

	// Bot per chat announcement
	conf.announceID = parseInt(process.env.MOTD_ID || "1");
	conf.announceText = process.env.MOTD_TXT || "TS3Bot Announcement (this will only appear once):\r\nPlease remember the TOS :)\r\nThanks for reading!";

	return conf;
};
