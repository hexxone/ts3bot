"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const Alfred = require('alfred-teamspeak');
const CONNECT_TRIES = 1;
const CONNECT_WAIT = 3000;

// represents a ts3 connection
class Instance {

    constructor(main, id, name) {
        // data that doesnt need to be exported
        this.main = main;
        // the client id of our own connected bot
        this.clid = null;

        this.bot = null;
        this.connectionState = 0; // 0=disconnected | 1=connecting | 2=connected | 3=disconnected(err)
        this.connectionErr = '';
        this.connectTry = 0;
        this.connectCallback = () => { };
        this.pingInterval = 0;

        this.serverinfo = {};
        this.channelid = 0;
        this.users = [];
        this.channels = [];

        // data to be exported when saving
        this.groups = [];
        this.trees = [];
        this.id = id;
        this.name = name;

        this.qname = "";
        this.qpass = "";
        this.addr = "";
        this.qport = "";
        this.sid = "";
        this.clientname = "";
        this.channelname = "";
        this.channeldepth = 0;
        this.autoconnect = false;
        this.greetmode = 0;
        this.greetmsg = 'Welcome to the Server. I am the Telegram to TS3 bot.';
    }

    owner() {
        return Utils.getUser({ id: this.id });
    }

    Export() {
        return {
            groups: this.groups,
            trees: this.trees,
            id: this.id,
            name: this.name,
            qname: this.qname,
            qpass: this.qpass,
            addr: this.addr,
            qport: this.qport,
            sid: this.sid,
            clientname: this.clientname,
            channelname: this.channelname,
            channeldepth: this.channeldepth,
            autoconnect: this.autoconnect,
            greetmode: this.greetmode,
            greetmsg: this.greetmsg,
        };
    }

    Connect(isreconnect, callback, respond) {
        // connecting state update
        this.connectionState = 1;
        if (isreconnect) this.connectTry++;
        else this.connectTry = 1;
        // ts3 bot settings
        let settings = {
            'name': this.clientname,
            'host': this.addr,
            'port': this.qport,
            'sid': this.sid
        };
        //console.log("settings: " + JSON.stringify(settings));
        this.bot = new Alfred(settings);

        console.log("Connecting...");

        // Bot was Disconnected
        this.bot.on('close', () => this.main.handleEx(() => {
            console.log(this.name + " | Disconnected.");
            let msgs = Utils.getLanguageMessages(this.owner.language);
            this.main.bot.sendNewMessage(this.id, msgs.botDisconnected + this.name);
            this.connectionErr = 'Connection closed by host.';
            this.Disconnect(this.autoconnect);
        }));

        // Client joined the server
        this.bot.on('cliententerview', data => this.main.handleEx(() => {
            //console.log("Join data: " + JSON.stringify(data));
            for (let usr of this.users)
                if (usr.clid === data.clid)
                    return; // user already connected

            // add object data
            this.users.push(data);
            // if the client is of type server query, the client_type will be 1
            let isbot = data.client_type == 1;
            //console.log("Is Bot: " + isbot);
            //console.log(this.name + " | Join: " + data.client_nickname)
            // Notify groups by looping all
            for (let gid of this.groups) {
                // get the linking for this group
                let lnk = Utils.getGroupLinking(gid);
                // dont notify for joins ?
                if (!lnk.notifyjoin) continue;
                // ignore query clients in this group ?
                if (isbot && lnk.ignorebots) continue;
                // build message
                let bName = "<b>" + this.fixNameToTelegram(data.client_nickname) + "</b>";
                let bFlag = ((isbot) ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(data.client_database_id) + "₎ ");
                let msgs = Utils.getLanguageMessages(lnk.language);
                // send Message
                lnk.NotifyTelegram(this.serverinfo.virtualserver_name, bName + bFlag + msgs.joinedServer);
            }
            // trigger tree update
            this.UpdateLiveTrees();
        }));

        // Client left the server
        this.bot.on('clientleftview', data => this.main.handleEx(() => {
            //console.log("Left data: " + JSON.stringify(data));
            for (let i = 0; i < this.users.length; i++) {
                let usr = this.users[i];
                if (usr.clid !== data.clid) continue;
                // we wanto to remove this user
                this.users.splice(i, 1);
                // if the client is of type server query, the client_type will be 1
                let isbot = usr.client_type == 1;
                //console.log(this.name + " | Left: " + usr.client_nickname);
                // Notify groups by looping all
                for (let gid of this.groups) {
                    // get the linking for this group
                    let lnk = Utils.getGroupLinking(gid);
                    // dont notify for joins ?
                    if (!lnk.notifyjoin) continue;
                    // ignore query clients in this group ?
                    if (isbot && lnk.ignorebots) continue;
                    // build message
                    let bName = "<b>" + this.fixNameToTelegram(usr.client_nickname) + "</b>";
                    let bFlag = ((isbot) ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(usr.client_database_id) + "₎ ");
                    let msgs = Utils.getLanguageMessages(lnk.language);
                    // send messages
                    lnk.NotifyTelegram(this.serverinfo.virtualserver_name, bName + bFlag + msgs.leftServer);
                }
            }
            // trigger tree update
            this.UpdateLiveTrees();
        }));

        // Client switched a channel, get user info and update in this.users
        this.bot.on('clientmoved', data => this.main.handleEx(() => {
            // loop all clients
            this.users.forEach((usr) => {
                if (usr.clid !== data.clid) return; // wrong client
                if (usr.cid == data.ctid) return; // Client move ignored (already in target channel)
                // if the client is a bot/server-query, the client_type will be 1
                let isbot = usr.client_type == 1;
                let oldChannel = usr.cid;
                usr.cid = data.ctid;
                //console.log(this.name + ' | Client moved: ' + usr.client_nickname);
                // get target channel
                for (let chan of this.channels) {
                    if (chan.cid != data.ctid) continue;
                    // notify all groups
                    for (let grp of this.groups) {
                        let lnk = Utils.getGroupLinking(grp);
                        if (!lnk) continue;
                        // ignore query clients in this group ?
                        if (isbot && lnk.ignorebots) continue;
                        // build message
                        let msgs = Utils.getLanguageMessages(lnk.language);
                        let srvname = this.serverinfo.virtualserver_name;
                        let bName = "<b>" + this.fixNameToTelegram(usr.client_nickname) + "</b>";
                        let bFlag = ((isbot) ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(usr.client_database_id) + "₎ ");
                        // notify group
                        switch (lnk.notifymove) {
                            // notify channel
                            case 1:
                                // user left our channel
                                if (this.channelid == oldChannel)
                                    lnk.NotifyTelegram(srvname, bName + bFlag + msgs.channelLeave + " [" + this.GetChannelUser(this.channelid, lnk.ignorebots).length + "]");
                                // user joined our channel
                                else if (this.channelid == data.ctid)
                                    lnk.NotifyTelegram(srvname, bName + bFlag + msgs.channelJoin + " [" + this.GetChannelUser(this.channelid, lnk.ignorebots).length + "]");
                                break;
                            // notify global
                            case 2:
                                lnk.NotifyTelegram(srvname, bName + bFlag + msgs.channelSwitch + " <b>" + chan.channel_name + "</b> [" + this.GetChannelUser(data.ctid, lnk.ignorebots).length + "]");
                                break;
                        }
                    }
                }
                // trigger tree update
                this.UpdateLiveTrees();
            });
        }));

        // Message received
        this.bot.on('textmessage', data => this.main.handleEx(() => {
            // ignore messages by the bot itself
            if (this.clid != null && data.invokerid == this.clid) return;
            // Get message
            let msgText = this.unescapeStr(data.msg);
            // is private bot message?
            if (data.targetmode === 1) {

                // TODO PM TO USER?

            }
            // Notify groups
            else this.NotifyGroups(data.targetmode, "<b>" + this.fixNameToTelegram(data.invokername) + "</b> : " + this.fixUrlToTelegram(msgText));
        }));

        // Start the login Process
        // @TODO: Check Permissions
        // 23	b_virtualserver_info_view	        Retrieve virtual server information
        // 24	b_virtualserver_connectioninfo_view	Retrieve virtual server connection information
        // 25	b_virtualserver_channel_list	    List channels on a virtual server
        // 27	b_virtualserver_client_list	        List clients online on a virtual server
        // 43	b_virtualserver_notify_register	    Register for server notifications
        // 44	b_virtualserver_notify_unregister	Unregister from server notifications
        this.bot.login(this.qname, this.qpass)
            // Get own client id (for moving & ignoring own messages)
            .then(() => this.bot.get('clid'))
            .then(clidd => {
                this.clid = clidd;
            })
            // get server info like name, users / slots
            .then(() => this.bot.send('serverinfo'))
            .then(srvi => {
                this.serverinfo = srvi;
            })
            // get the user list once (will then be updated by events)
            .then(() => this.bot.send('clientlist', '-uid'))
            .then(data => {
                this.users = this.formatData(data);
            })
            // get the channel list and try to move to the given channel
            .then(() => this.bot.send('channellist'))
            .then(channeldata => {
                this.channels = this.formatData(channeldata);
                if (this.channels.length < 1) throw "No channels found (permission?).";
                // if a channel is set, try to find it & move to it
                if (this.channelname !== "") {
                    // search all channels for the one with our desired name and get its id
                    let myChannel = this.GetChannelByName(this.channelname);
                    //console.log(this.name + " | Found Channel: " + myChannel);
                    if (myChannel === null) throw "Target channel was not found (case sensitive).";
                    this.channelid = myChannel.cid;
                    // Move the bot to desired channel
                    this.bot.send('clientmove clid=' + this.clid + ' cid=' + this.channelid);
                }
            })
            // Register for join & leave, move & text message events (maybe check permissions first?)
            .then(() => this.bot.send('servernotifyregister', { 'event': 'server' }))
            .then(() => this.bot.send('servernotifyregister', { 'event': 'channel', 'id': 0 }))
            .then(() => this.bot.send('servernotifyregister', { 'event': 'textserver' }))
            .then(() => this.bot.send('servernotifyregister', { 'event': 'textchannel' }))
            .then(() => this.bot.send('servernotifyregister', { 'event': 'textprivate' }))
            // Successfully connected, notify groups / ts3 and start keepalive
            .then(() => {
                let tcnt = this.GetUserCount(true);
                let bcnt = (this.users.length - tcnt);
                let busr = this.main.me.username;
                // send ts3 msg
                this.SendChannelMessage("Hi! [URL=https://t.me/" + busr + "]" + busr + "[/URL] is now active.", true);
                // send message for each group & language seperately
                for (let grp of this.groups) {
                    let lnk = Utils.getGroupLinking(grp);
                    if (!lnk) continue;
                    // build message
                    let msgs = Utils.getLanguageMessages(lnk.language);
                    let tmpmsg = "<b>" + busr + msgs.botConnected.replace('<users>', tcnt).replace('<bots>', bcnt);
                    lnk.NotifyTelegram(this.serverinfo.virtualserver_name, tmpmsg);
                }
                // send message to owner
                let owner = Utils.getUser({ id: this.id });
                let msgs = Utils.getLanguageMessages(owner.language);
                let tmpmsg = "<b>" + busr + msgs.botConnected.replace('<users>', tcnt).replace('<bots>', bcnt);
                let opt = {
                    parse_mode: "html",
                    reply_markup: { inline_keyboard: [[Utils.getCmdBtn('menu', msgs)]] }
                };
                // "respond" if possible
                if (respond) respond(tmpmsg, opt);
                else this.main.bot.sendNewMessage(this.id, tmpmsg, opt);
                // start ping to prevent timeout
                this.pingInterval = setInterval(() => this.RunPing(this), 2 * 60 * 1000); // Every 2 minutes
                this.connectionState = 2;
                if (callback) callback();
                // trigger tree update
                this.UpdateLiveTrees();
            })
            // We have an error somewhere, inform the owner
            .catch(err => {
                this.connectionState = 3;
                this.connectionErr = JSON.stringify(err);
                console.log('TS3 con err: ' + this.connectionErr);
                this.Disconnect((this.connectTry < CONNECT_TRIES), true); // disconnect with on error trigger
            });

    }

    // Disconnects the Bot from the server, no matter which state
    Disconnect(stayconnected, onerror) {
        if (this.bot !== null)
            this.bot.send('quit').catch(err => {
                console.log('quit error! server: ' + this.name + ', err: ' + JSON.stringify(err));
            });
        this.bot = null;
        this.connectionState = 0;
        this.KillPing(this);
        if (stayconnected) setTimeout(() => this.Connect(), CONNECT_WAIT);
        else if (onerror) {
            this.UpdateLiveTrees(true);
            this.connectionState = 3;
            let msgs = Utils.getLanguageMessages(this.owner().language);
            this.main.bot.sendNewMessage(this.id, msgs.connectError.replace('<attempts>', this.connectTry) + this.connectionErr);
        }
    }

    GetChannelByName(name) {
        for (let chn of this.channels) {
            if (chn.channel_name == name)
                return chn;
        }
        return null;
    }

    GetChannelById(id) {
        for (let chn of this.channels) {
            if (chn.cid == id)
                return chn;
        }
        return null;
    }

    GetUserCount(ignorebots) {
        let cnt = this.users.length;
        // subtract query clients
        if (ignorebots) {
            for (let usr of this.users)
                if (usr.client_type == 1)
                    cnt--;
        }
        return cnt;
    }

    GetChannelUser(cid, ignorebots) {
        let userArr = [];
        // Add users to array grouped by channel
        for (let usr of this.users) {
            // if wrong channel, ignore
            if (usr.cid != cid) continue;
            // if this is a query client, ignore him
            if (usr.client_type == 1 && ignorebots) continue;
            // push user to respective "channel"-array
            userArr.push(usr);
        }
        return userArr;
    }

    // Returns the currently online users grouped by channels as String
    GetUserString(language, ignorebots, callback) {
        let msgs = Utils.getLanguageMessages(language);
        if (this.connectionState == 2) {
            let userStruct = {};
            // Add users to array grouped by channel
            for (let usr of this.users) {
                // if this is a query client, ignore him
                if (usr.client_type == 1 && ignorebots) continue;
                // if array not defined, do it
                if (!userStruct[usr.cid]) userStruct[usr.cid] = [];
                // push user to respective "channel"-array
                userStruct[usr.cid].push(usr);
            }
            //console.log(this.name + " | getting users: " + JSON.stringify(userStruct));
            let result = this.GetUserCount(ignorebots) + " / " + this.serverinfo.virtualserver_maxclients + msgs.userOnline + " <code>";
            // Loop all channelIds
            for (let cid of Object.keys(userStruct)) {
                // get channel
                let channel = this.GetChannelById(cid);
                //console.log("CID: " + cid + " Channel: " + JSON.stringify(channel));
                if (!channel) continue;
                // Add channelname and users
                let chres = '\r\n( ' + this.fixSpacer(channel.channel_name) + ' ) [' + userStruct[cid].length + ']';
                for (let usr in userStruct[cid]) {
                    let user = userStruct[cid][usr];
                    let isbot = user.client_type == 1;
                    if (isbot && ignorebots) continue;
                    let bName = this.fixNameToTelegram(user.client_nickname);
                    let bFlag = ((isbot) ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(user.client_database_id) + "₎ ");
                    chres += '\r\n - ' + bName + bFlag;
                }
                // channeldepth thingy
                for (let i = 0; i < this.channeldepth; i++) {
                    let mainCh = this.GetChannelById(channel.pid);
                    if (mainCh === null) break;
                    chres = '\r\n( ' + this.fixSpacer(mainCh.channel_name) + ' ) ' + chres.replace('\r\n', '\r\n\t');
                    channel = mainCh;
                }
                result += chres;
            }
            // hello? no one there?
            if (Object.keys(userStruct).length === 0) {
                result = msgs.noUsersOnline;
            }
            else result += "</code>";
            // send result
            callback(result);
        }
        // bot not connected, but autoconnect is active and callback is given
        else if (this.autoconnect) {
            callback(msgs.autoConnecting);
            this.Connect(false, () => this.GetUserString(language, ignorebots, callback));
        }
        // bot stays not connected
        else callback(msgs.notConnected);
    }

    // callack is function and takes 1 argument: msg string
    GetSimpleUserString(language, ignorebots, callback) {
        let msgs = Utils.getLanguageMessages(language);
        if (this.connectionState == 2) {
            let result = this.GetUserCount(ignorebots) + " / " + this.serverinfo.virtualserver_maxclients + msgs.userOnline + " <code>";
            let userStruct = {};
            // Add users to array grouped by channel
            for (let usr of this.users) {
                // if this is a query client, ignore him
                if (usr.client_type == 1 && ignorebots) continue;
                // Add /Increment user channel count
                if (!userStruct[usr.cid]) userStruct[usr.cid] = 0;
                userStruct[usr.cid]++;
            }
            // Loop all channelIds
            for (let cid of Object.keys(userStruct)) {
                // Add channelname and user count
                let channel = this.GetChannelById(cid);
                result += '\r\n( ' + this.fixSpacer(channel.channel_name) + ' ) [' + userStruct[cid] + ']';
            }
            callback(result + "</code>");
        }
        // bot not connected, but autoconnect is active and callback is given
        else if (this.autoconnect) {
            callback(msgs.autoConnecting);
            this.Connect(false, () => this.GetSimpleUserString(language, ignorebots, callback));
        }
        // bot stays not connected
        else callback(msgs.notConnected);
    }

    // Send a Text Message to the Server Chat, visible for anyone
    // URLS need ro be fixed beforehand using Utils.fixUrlToTS3
    SendGlobalMessage(msg) {
        // prep msg
        msg = this.escapeStr(msg);
        if (this.connectionState == 2 || this.connectionState == 1) {
            this.bot.send('sendtextmessage targetmode=3 target=' + this.channelid + ' msg=' + msg);
        }
        // bot not connected, but autoconnect is active and callback is given
        else if (this.autoconnect) {
            this.Connect(false, () => {
                this.bot.send('sendtextmessage targetmode=3 target=' + this.channelid + ' msg=' + msg);
            });
        }
    }

    // Send a Text Message to the current Bot Channel
    // URLS need ro be fixed beforehand using Utils.fixUrlToTS3
    SendChannelMessage(msg) {
        // prep msg
        msg = this.escapeStr(msg);
        if (this.connectionState == 2 || this.connectionState == 1) {
            this.bot.send('sendtextmessage targetmode=2 target=' + this.sid + ' msg=' + msg);
        }
        // bot not connected, but autoconnect is active and callback is given
        else if (this.autoconnect) {
            this.Connect(false, () => {
                this.bot.send('sendtextmessage targetmode=2 target=' + this.sid + ' msg=' + msg);
            });
        }
    }

    // Send a Text Message to the given user (case sensitive)
    SendPrivateMessage(user, msg) {
        if (this.bot != null) {
            msg = this.fixUrlToTS3(msg);
            this.bot.send('clientfind pattern=' + escape(user), function () {
                this.bot.send('sendtextmessage targetmode=3 target=1 msg=' + this.escapeStr(msg));
            });
        }
    }


    /*
     * TELEGARM GROUP NOTIFICATION
     */

    NotifyGroups(targetmode, message) {
        for (let gid of this.groups) {
            let gl = Utils.getGroupLinking(gid);
            if (targetmode !== 0 && gl.chatmode != targetmode) continue;
            gl.NotifyTelegram(this.serverinfo.virtualserver_name, message);
        }
    }

    // Checks if the desired groupid is already registered
    HasGroup(group) {
        let index = this.groups.indexOf(group);
        let ret = (index > -1);
        return ret;
    }

    // Add the given groupid
    AddGroup(group) {
        if (this.HasGroup(group)) return;
        this.groups.push(group);
    }

    // Removes the given groupid
    RemoveGroup(group) {
        let index = this.groups.indexOf(group);
        if (index > -1) this.groups.splice(index, 1);
    }

    /*
     * LIVE TREE AREA
     */

    GetChannelsBymain(id) {
        let res = [];
        for (let chn of this.channels) {
            if (chn.pid == id)
                res.push(chn);
        }
        return res;
    }

    GetChannelTree(root, ignorebots, recursive) {

        // todo: user muted symbol? mic? afk?

        let childr = this.GetChannelsBymain(root);
        let userr = this.GetChannelUser(root, ignorebots);
        let chres = "";
        if (root == 0) {
            chres += this.serverinfo.virtualserver_name + " (" + this.GetUserCount(ignorebots) + " / " + this.serverinfo.virtualserver_maxclients + ")";
        }
        else {
            let rootc = this.GetChannelById(root);
            chres += this.fixSpacer(rootc.channel_name);
            // include users in channel
            if (userr.length > 0) {
                chres += ' [' + userr.length + ']';
                for (let usr in userr) {
                    let user = userr[usr];
                    let isbot = user.client_type == 1;
                    if (isbot && ignorebots) continue;
                    let bName = this.fixNameToTelegram(user.client_nickname);
                    let bFlag = ((isbot) ? " (bot) " : " ₍" + Utils.getNumberSmallASCII(user.client_database_id) + "₎ ");
                    chres += '\r\n - ' + bName + bFlag;
                }
            }
        }
        // todo correct order?
        // recursive downwards call
        if (recursive) {
            for (let chil in childr) {
                let child = childr[chil];
                let cmsg = this.GetChannelTree(child.cid, ignorebots, true);
                chres += "\r\n" + cmsg.split('\r\n').join('\r\n  ');
            }
        }
        return chres;
    }

    // returns the current server tree
    GetServerTree(language, ignorebots, callback, isError) {
        let msgs = Utils.getLanguageMessages(language);
        if (isError || this.connectionState == 2) {
            let msg = msgs.liveTreeFormat;
            msg = msg.replace('<tree>', this.GetChannelTree(0, ignorebots, true));
            msg = msg.replace('<time>', isError ? msgs.liveTreeError : Utils.getTime());
            callback(msg);
        }
        // bot not connected, but autoconnect is active and callback is given
        else if (this.connectionState != 1 && this.autoconnect) {
            callback(msgs.autoConnecting);
            this.Connect(false, () => this.GetServerTree(language, ignorebots, callback));
        }
        // bot stays not connected
        else callback(msgs.notConnected);
    }

    UpdateLiveTree(tree, error) {
        let cobj = tree > 0 ? Utils.getUser({ id: tree }) : Utils.getGroupLinking(tree);
        if(!cobj || !cobj.language) {
            console.log("Critical: cant find chat object for live tree: " + JSON.stringify([tree,cobj]));
            return;
        }
        this.GetServerTree(cobj.language, cobj.ignorebots, text => {
            //console.log("tree: " + text);
            let opt = {
                parse_mode: "html"
            };
            if (cobj.livetree) {
                console.log("Update tree: " + cobj.livetree);
                opt.chat_id = tree;
                opt.message_id = cobj.livetree;
                this.main.bot.editMessageText(text, opt);
            }
            else {
                this.main.bot.sendMessage(tree, text, opt).then(msg => {
                    cobj.livetree = msg.message_id;
                    console.log("New tree: " + cobj.livetree);
                });
            }
        }, error);
    }

    UpdateLiveTrees(error) {
        for (let lt in this.trees) {
            let tree = this.trees[lt];
            this.UpdateLiveTree(tree, error);
        }
    }

    AddLiveTree(chatId) {
        let index = this.trees.indexOf(chatId);
        if (index < 0) this.trees.push(chatId);
        this.UpdateLiveTree(chatId);
    }

    RemoveLiveTree(chatId) {
        let index = this.trees.indexOf(chatId);
        if (index > -1) this.trees.splice(index, 1);
        let cobj = chatId > 0 ? Utils.getUser({ id: chatId }) : Utils.getGroupLinking(chatId);
        if (cobj.livetree) { 
            this.main.bot.deleteMessage(chatId, cobj.livetree);
            cobj.livetree = null;
            this.main.bot.sendMessage(chatId, Utils.getLanguageMessages(cobj.language).liveTreeStop);
        }
    }

    /**
     * Utility functions
     */

    // Function for pinging the server to prevent timeouts
    RunPing(self) {
        if (self.connectionState == 2) {
            //console.log(self.name + " | Updating Channels & Users...");
            let errfunc = function (err) {
                self.connectionErr = JSON.stringify(err);
                console.log("Ping Err: " + self.connectionErr);
                if (self.autoconnect) {
                    self.connectTry = 0;
                    self.Disconnect(true);
                }
                else self.Disconnect(false, true);
            }
            // update channels (e.g channel name change)
            self.bot.send('channellist').then(channeldata => {
                self.channels = self.formatData(channeldata);
            }).catch(err => errfunc(err));
            // update clients (e.g. name changes)
            self.bot.send('clientlist', '-uid').then(clientdata => {
                self.users = self.formatData(clientdata);
            }).catch(err => errfunc(err));

            //console.log("PING!");
        }
        else self.KillPing();
    }

    KillPing() {
        let self = this;
        if (self.pingInterval) {
            //console.log(self.name + " | Instance not connected. Stopping updater...");
            clearInterval(self.pingInterval);
            self.pingInterval = null;
        }
    }

    // Function that excludes the [spacer] strings from channel names
    fixSpacer(str) {
        return String(str).replace(/(\[\*{0,1}[l,r,c]{0,1}spacer[0-9]{0,}\])/g, '');
    }

    fixNameToTelegram(str) {
        // fix ip address leak
        let ip = str.match('/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\:?([0-9]{1,5})?/');
        if (ip) {
            if (typeof ip == typeof []) {
                for (let i = 0; i < length(ip); i++)
                    str = str.replace(ip[i], "[IP]");
            }
            else str = str.replace(ip, "[IP]");
        }
        return str;
    }

    fixUrlToTelegram(str) {
        // remove [URL]-Tags from links
        return str.replace(/\[\/*URL\]/g, '');
    }

    // Function for escaping a string message before sending
    escapeStr(str) {
        return String(str).replace(/\\/g, '\\\\')
            .replace(/\//g, '\\/')
            .replace(/\|/g, '\\p')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/\v/g, '\\v')
            .replace(/\f/g, '\\f')
            .replace(/ /g, '\\s');
    }

    // Function for un-escaping a string message after receiving
    unescapeStr(str) {
        return String(str).replace(/\\\\/g, '\\')
            .replace(/\\\//g, '/')
            .replace(/\\p/g, '|')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\v/g, '\v')
            .replace(/\\f/g, '\f')
            .replace(/\\s/g, ' ');
    }

    // teamspeak uses the parameter arrays, since all data fields
    // are always sent per object and it uses a little bit less "bandwidth"
    // so this function reformats the data to objects..
    // from:  parameter arrays  {"a":["1","4"],"b":["2","5"],"c":["3","6"]}
    // to:    object array      [{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"}]
    formatData(data) {
        return Object.keys(data).reduce((arr, key) => {
            if (data[key] instanceof Array) {
                data[key].forEach((value, i) => {
                    if (!arr[i]) arr[i] = {};
                    arr[i][key] = value;
                });
            }
            return arr;
        }, []);
    }
}

// export the class
module.exports = Instance;

// circular reference needs to be loaded after export..
let Utils = require('./utils.js').Get();
