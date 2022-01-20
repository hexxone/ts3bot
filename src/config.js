"use strict";

//
// Copyright (c) 2019 D.Thiele All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

module.exports = (self) => {
	// self is the main self of the app to apply settings to.

	// bot token from @BotFather in Telegram
	// will be used to encrypt & store the individual bot data
	self.telegram_bot_token = process.env.BOT_TOKEN || "<TOKEN_ERROR>";

	// Telegram only supports HTTPS connections to WebHooks.
	// Therefore, in order to use the bot with a WebHook, you will need a SSL certificate.
	// If you already setup Cloudflare with SSL for your domain, you usually dont need to do anything.

	// Use Webhook? if set to false, polling is used
	self.useWebHook = process.env.WEBHOOK == "true" || false;
	// the address the webhook should use and where your server is reachable.
	// dont include the https:// part, as it is added automatically.
	self.webHookAddr = process.env.WEBHOOK_ADDR || "bot.example.com";
	// Only following Ports are allowed by Telegram: [80,443,8080,8443]
	// Btw cloudflare will only support these aswell
	self.webHookPort = process.env.WEBHOOK_PORT || 443;

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
	self.webKey = __dirname + "/app/data/key.pem";
	// public key
	self.webCert = __dirname + "/app/data/crt.pem";
	// When using self signed certificate (not external SSL), set to true
	self.webHookCustomCertificate = process.env.CUSTOM_CERT == "true" || false;

	// Polling Config (only matters when not using webhook)
	self.pollTimeout = process.env.POLL_TIMEOUT || 65;
	self.pollInterval = process.env.POLL_INTERVAL || 1000;

	// File Proxy?
	// will allow files shared in Telegram to be downloaded from your TeamSpeak users.
	// Note: this will abviously expose the bot-ip to users.
	self.useFileProxy = process.env.FILE_PROXY == "true" || false;
	self.fileProxyPort = process.env.FILE_PROXY_PORT || 8080;
	self.fileProxyAddr = process.env.FILE_PROXY_ADDR || self.webHookAddr;

	// The Telegram User ID of the Developer (for admin & special commands)
	self.developer_id = process.env.DEVELOPER_ID || 12345678;
	// will send occuring Exceptions to the Developer if possible.
	self.debug = process.env.DEBUG == "true" || false;

	// the default language the bot will use for new users
	self.defaultLanguage = process.env.LANGUAGE || "Eng";

	// Bot per chat announcement
	self.announceID = process.env.MOTD_ID || 1;
	self.announceText =
		process.env.MOTD_TXT ||
		"TS3Bot Announcement (this will only appear once):\r\nPlease remember the TOS :)\r\nThanks for reading!";
};
