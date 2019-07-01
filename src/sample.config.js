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
    self.telegram_bot_token = '12345678:AAAAAAAAAAAAAAAAAAAAAAAAAA';


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
    self.useWebHook = true;
    // the address the webhook should use and where your server is reachable.
    // dont include the https:// part, as it is added automatically.
    self.webHookAddr = 'example.com';
    // Only following Ports are allowed by Telegram: [80,443,8080,8443]
    self.webHookPort = 8443;

    // Either generate a Cert in Cloudflare and save it locallly or
    // generate a cert locally as above and set the file paths.
    // private key
    self.webKey = __dirname + '/../res/cf_key.pem'; 
    // public key
    self.webCert = __dirname + '/../res/cf_crt.pem';  
    // When using self signed certificate (not Cloudflare), set to true
    self.webHookCustomCertificate = false;


    // Polling Config (only matters if not using webhook)
    self.pollTimeout = 65;
    self.pollInterval = 1000;


    // File Proxy?
    self.useFileProxy = true;
    self.fileProxyPort = 8080;
    self.fileProxyAddr = 'fileproxy.' + self.webHookAddr;


    // The Telegram User ID of the Developer (for special commands)
    self.developer_id = 12345678;
    // will send occuring Exceptions to the Developer if possible.
    self.debug = true;

    // the default language the bot will use for new users
    self.defaultLanguage = 'Eng';

    // Bot per chat announcement
	// Can only be changed every restart
    self.announceID = 1;
    self.announceText = 'TS3Bot Announcement (this will only appear once):\r\nThe bot has gone through alot of change and is now back online as you can read :)\r\nSadly you need to reconfigure the servers if you wish to use the bot again - sorry for the inconvenience.\r\nIf you find a bug, please report it using /devmessage.\r\nThanks for reading!';
};