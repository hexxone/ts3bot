'use strict';

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

module.exports = self => {
    // self is the main self of the app to apply settings to.

    // bot token from @BotFather in Telegram
    // will be used to encrypt & store the individual bot data
    self.telegram_bot_token = process.env.BOT_TOKEN || '<TOKEN_ERROR>';


    // Telegram only supports HTTPS connections to WebHooks.
    // Therefore, in order to use the bot with a WebHook, you will need a SSL certificate.
    // If you already setup Cloudflare with SSL for your domain, you usually dont need to do anything.
    // Alternativce: Since August 29, 2015 Telegram supports self-signed certificates, here is how to generate one:
    // 
    // # Our private certificate will be the following, exported as "key.pem" - dont share this file!
    // on linux: $ openssl genrsa -out key.pem 2048
    // 
    // # Our public certificate takes the "private" one as input and will be exported as "crt.pem"
    // on linux: $ openssl req -new -sha256 -key key.pem -out crt.pem
    //
    // Use Webhook? if set to false, polling is used
    self.useWebHook = process.env.WEBHOOK || false;
    // the address the webhook should use and where your server is reachable.
    // dont include the https:// part, as it is added automatically.
    self.webHookAddr = process.env.WEBHOOK_ADDR || 'bot.example.com';
    // Only following Ports are allowed by Telegram: [80,443,8080,8443]
    // Btw cloudflare will only support these aswell
    self.webHookPort = process.env.WEBHOOK_PORT || 443;

    // Either generate a Cert in Cloudflare and save it locallly or
    // generate a cert locally as above and set the file paths.
    // private key
    self.webKey = __dirname + '/app/data/key.pem';
    // public key
    self.webCert = __dirname + '/app/data/crt.pem';
    // When using self signed certificate (not Cloudflare), set to true
    self.webHookCustomCertificate = process.env.CUSTOM_CERT || false;


    // Polling Config (only matters if not using webhook)
    self.pollTimeout = process.env.POLL_TIMEOUT || 65;
    self.pollInterval = process.env.POLL_INTERVAL || 1000;


    // File Proxy?
    self.useFileProxy = process.env.FILE_PROXY || false;
    self.fileProxyPort = process.env.FILE_PROXY_PORT || 8080;
    self.fileProxyAddr = process.env.FILE_PROXY_ADDR || self.webHookAddr;


    // The Telegram User ID of the Developer (for special commands)
    self.developer_id = process.env.DEVELOPER_ID || 12345678;
    // will send occuring Exceptions to the Developer if possible.
    self.debug = process.env.DEBUG || false;

    // the default language the bot will use for new users
    self.defaultLanguage = process.env.LANGUAGE || 'Eng';

    // Bot per chat announcement
    self.announceID = process.env.MOTD_ID || 1;
    self.announceText = process.env.MOTD_TXT || 'TS3Bot Announcement (this will only appear once):\r\nThe bot has changed a lot and is now back online :)\r\nIf you find a bug, please report it using /devmessage.\r\nThanks for reading!';
};