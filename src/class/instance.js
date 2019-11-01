'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Alfred = require('alfred-teamspeak');
const CONNECT_TRIES = 3;
const CONNECT_WAIT = 5000;
const PING_INTERVAL = 30000; // 30 seconds

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
        // the users and channels are already correctly sorted when received.
        this.users = [];
        this.channels = [];

        // data to be exported when saving
        this.groups = [];
        this.trees = [];

        this.id = id;
        this.name = name;

        this.qname = '';
        this.qpass = '';
        this.addr = '';
        this.qport = '';
        this.sid = '';
        this.clientname = '';
        this.channelname = '';
        this.channeldepth = 0;
        this.autoconnect = false;

        // TODO utilize greetmode & create setting command?
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
        //console.log('settings: ' + JSON.stringify(settings));
        this.bot = new Alfred(settings);

        console.log('Connecting...');

        // Bot was Disconnected
        this.bot.on('close', () => this.main.handleEx(() => {
            console.log(this.name + ' | Disconnected.');
            let msgs = Utils.getLanguageMessages(this.owner.language);
            this.main.bot.sendNewMessage(this.id, msgs.botDisconnected + this.name);
            this.connectionErr = 'Connection closed by server.';
            this.Disconnect(this.autoconnect);
        }));

        // Client joined the server
        this.bot.on('cliententerview', data => this.main.handleEx(() => {
            //console.log('Join data: ' + JSON.stringify(data));
            for (let usr of this.users)
                if (usr.clid === data.clid)
                    return; // user already connected

            // add object data
            this.users.push(data);
            this.SortUsers();
            // if the client is of type server query, the client_type will be 1
            let isbot = data.client_type == 1;
            //console.log('Is Bot: ' + isbot);
            //console.log(this.name + ' | Join: ' + data.client_nickname)
            // Notify groups by looping all
            for (let gid of this.groups) {
                // get the linking for this group
                let lnk = Utils.getGroupLinking(gid);
                // dont notify for joins ?
                if (!lnk.notifyjoin) continue;
                // ignore query clients in this group ?
                if (isbot && lnk.ignorebots) continue;
                // build message
                let bName = '<b>' + this.fixNameToTelegram(data.client_nickname) + '</b>';
                let bFlag = ((isbot) ? ' (bot) ' : ' ₍' + Utils.getNumberSmallASCII(data.client_database_id) + '₎ ');
                let msgs = Utils.getLanguageMessages(lnk.language);
                // send Message
                lnk.NotifyTelegram(this.serverinfo.virtualserver_name, bName + bFlag + msgs.joinedServer);
            }
            // trigger tree update
            this.UpdateLiveTrees();
        }));

        // Client left the server
        this.bot.on('clientleftview', data => this.main.handleEx(() => {
            //console.log('Left data: ' + JSON.stringify(data));
            for (let i = 0; i < this.users.length; i++) {
                let usr = this.users[i];
                if (usr.clid !== data.clid) continue;
                // we wanto to remove this user
                this.users.splice(i, 1);
                // if the client is of type server query, the client_type will be 1
                let isbot = usr.client_type == 1;
                //console.log(this.name + ' | Left: ' + usr.client_nickname);
                // Notify groups by looping all
                for (let gid of this.groups) {
                    // get the linking for this group
                    let lnk = Utils.getGroupLinking(gid);
                    // dont notify for joins ?
                    if (!lnk.notifyjoin) continue;
                    // ignore query clients in this group ?
                    if (isbot && lnk.ignorebots) continue;
                    // build message
                    let bName = '<b>' + this.fixNameToTelegram(usr.client_nickname) + '</b>';
                    let bFlag = ((isbot) ? ' (bot) ' : ' ₍' + Utils.getNumberSmallASCII(usr.client_database_id) + '₎ ');
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
                        let bName = '<b>' + this.fixNameToTelegram(usr.client_nickname) + '</b>';
                        let bFlag = ((isbot) ? ' (bot) ' : ' ₍' + Utils.getNumberSmallASCII(usr.client_database_id) + '₎ ');
                        // notify group
                        switch (lnk.notifymove) {
                            // notify channel
                            case 1:
                                // user left our channel
                                if (this.channelid == oldChannel)
                                    lnk.NotifyTelegram(srvname, bName + bFlag + msgs.channelLeave + ' [' + this.GetChannelUser(this.channelid, lnk.ignorebots).length + ']');
                                // user joined our channel
                                else if (this.channelid == data.ctid)
                                    lnk.NotifyTelegram(srvname, bName + bFlag + msgs.channelJoin + ' [' + this.GetChannelUser(this.channelid, lnk.ignorebots).length + ']');
                                break;
                            // notify global
                            case 2:
                                lnk.NotifyTelegram(srvname, bName + bFlag + msgs.channelSwitch + ' <b>' + chan.channel_name + '</b> [' + this.GetChannelUser(data.ctid, lnk.ignorebots).length + ']');
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
            else this.NotifyGroups(data.targetmode, '<b>' + this.fixNameToTelegram(data.invokername) + '</b> : ' + this.fixUrlToTelegram(msgText));
        }));

        // Start the login Process
        // if Permissions fail, they will return an error message to the instance owner:
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
            .then(() => this.bot.send('clientlist', '-uid -away -voice -times'))
            .then(data => {
                this.users = this.formatData(data);
                this.SortUsers();
            })
            // get the channel list and try to move to the given channel
            .then(() => this.bot.send('channellist', '-topic -flags -voice'))
            .then(channeldata => {
                this.channels = this.formatData(channeldata);
                if (this.channels.length < 1) throw 'No channels found (permission?).';
                // if a channel is set, try to find it & move to it
                if (this.channelname !== '') {
                    // search all channels for the one with our desired name and get its id
                    let myChannel = this.GetChannelByName(this.channelname);
                    //console.log(this.name + ' | Found Channel: ' + myChannel);
                    if (myChannel === null) throw 'Target channel was not found (case sensitive).';
                    this.channelid = myChannel.cid;
                    // Move the bot to desired channel
                    this.bot.send('clientmove clid=' + this.clid + ' cid=' + this.channelid);
                }
            })
            // Register for join & leave, move & text message events (maybe check permissions first?)
            .then(() => this.bot.send('servernotifyregister', { 'event': 'server' }))
            .then(() => this.bot.send('servernotifyregister', { 'event': 'channel', 'id': 0 })) // channel id 0 will ensure we always receive all channel events
            .then(() => this.bot.send('servernotifyregister', { 'event': 'textserver' }))
            .then(() => this.bot.send('servernotifyregister', { 'event': 'textchannel' }))
            .then(() => this.bot.send('servernotifyregister', { 'event': 'textprivate' }))
            // Successfully connected, notify groups / ts3 and start keepalive
            .then(() => {
                let tcnt = this.GetUserCount(true);
                let bcnt = (this.users.length - tcnt);
                let busr = this.main.me.username;
                // send ts3 msg
                this.SendChannelMessage('Hi! [URL=https://t.me/' + busr + ']' + busr + '[/URL] is now active.', true);
                // send message for each group & language seperately
                for (let grp of this.groups) {
                    let lnk = Utils.getGroupLinking(grp);
                    if (!lnk) continue;
                    // build message
                    let msgs = Utils.getLanguageMessages(lnk.language);
                    let tmpmsg = '<b>' + busr + msgs.botConnected.replace('<users>', tcnt).replace('<bots>', bcnt);
                    lnk.NotifyTelegram(this.serverinfo.virtualserver_name, tmpmsg);
                }
                // send message to owner
                let owner = Utils.getUser({ id: this.id });
                let msgs = Utils.getLanguageMessages(owner.language);
                let tmpmsg = '<b>' + busr + msgs.botConnected.replace('<users>', tcnt).replace('<bots>', bcnt);
                let opt = {
                    parse_mode: 'html',
                    reply_markup: { inline_keyboard: [[Utils.getCmdBtn('menu', msgs)]] }
                };
                // 'respond' if possible
                if (respond) respond(tmpmsg, opt);
                else this.main.bot.sendNewMessage(this.id, tmpmsg, opt);
                // start ping to prevent timeout
                this.pingInterval = setInterval(() => this.RunPing(this), PING_INTERVAL);
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
        if (stayconnected) setTimeout(() => this.Connect(onerror), CONNECT_WAIT);
        else if (onerror) {
            this.UpdateLiveTrees(true);
            this.connectionState = 3;
            let msgs = Utils.getLanguageMessages(this.owner().language);
            this.main.bot.sendNewMessage(this.id, msgs.connectError.replace('<attempts>', this.connectTry) + this.connectionErr);
        }
    }


    /*
     *   CHANNEL AND USER HELPERs
     */

    // this function will re-sort the user list alphabetically by name after a user joined.
    // this is required to have the correct user-order in channels (/livetree and /users).
    // you dont have to do it after leave since the array just gets spliced at correct position.
    SortUsers() {
        this.users.sort(function (a, b) {
            return ((a.client_nickname < b.client_nickname) ? -1 : ((a.client_nickname == b.client_nickname) ? 0 : 1));
        });
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
            // push user to respective 'channel'-array
            userArr.push(usr);
        }
        return userArr;
    }

    // Auto-Connect wrapper
    // will check if the server is currently connected.
    // if not, it will 
    WrapAutoConnect(language, respond, connectedCallback, passCondition) {
        let msgs = Utils.getLanguageMessages(language);
        if (this.connectionState == 2 || passCondition) {
            connectedCallback();
        }
        // bot not connected, but autoconnect is active and callback is given
        else if (this.connectionState != 1 && this.autoconnect) {
            respond(msgs.autoConnecting);
            this.Connect(false, () => connectedCallback);
        }
        // bot stays not connected
        else respond(msgs.notConnected);
    }

    /*
     *  OLD User formatting (TODO optimize?)
     */

    // Returns the currently online users grouped by channels as String
    GetUserString(language, ignorebots, callback) {
        this.WrapAutoConnect(language, callback, () => {
            let msgs = Utils.getLanguageMessages(language);
            let userStruct = {};
            // Add users to array grouped by channel
            for (let usr of this.users) {
                // if this is a query client, ignore him
                if (usr.client_type == 1 && ignorebots) continue;
                // if array not defined, do it
                if (!userStruct[usr.cid]) userStruct[usr.cid] = [];
                // push user to respective 'channel'-array
                userStruct[usr.cid].push(usr);
            }
            //console.log(this.name + ' | getting users: ' + JSON.stringify(userStruct));
            let result = this.GetUserCount(ignorebots) + ' / ' + this.serverinfo.virtualserver_maxclients + msgs.userOnline + ' <code>';
            // Loop all channelIds
            for (let cid of Object.keys(userStruct)) {
                // get channel
                let channel = this.GetChannelById(cid);
                if (!channel) continue;
                // Add channelname and users
                let chres = '\r\n( ' + this.fixSpacer(channel.channel_name) + ' ) [' + userStruct[cid].length + ']';
                for (let usr in userStruct[cid]) {
                    let user = userStruct[cid][usr];
                    let isbot = user.client_type == 1;
                    if (isbot && ignorebots) continue;
                    let bName = this.fixNameToTelegram(user.client_nickname);
                    let bFlag = ((isbot) ? ' (bot) ' : ' ₍' + Utils.getNumberSmallASCII(user.client_database_id) + '₎ ');
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
            else result += '</code>';
            // send result
            callback(result);
        });
    }

    // callack is function and takes 1 argument: msg string
    GetSimpleUserString(language, ignorebots, callback) {
        this.WrapAutoConnect(language, callback, () => {
            let msgs = Utils.getLanguageMessages(language);
            let result = this.GetUserCount(ignorebots) + ' / ' + this.serverinfo.virtualserver_maxclients + msgs.userOnline + ' <code>';
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
            callback(result + '</code>');
        });
    }


    /*
     *  TS3 MESSAGE SEND
     */

    // Send a Text Message to the Server Chat, visible for anyone
    // URLS need ro be fixed beforehand using Utils.fixUrlToTS3
    SendGlobalMessage(msg) {
        // prep msg
        msg = this.escapeStr(msg);
        if (this.connectionState == 2) {
            this.bot.send('sendtextmessage targetmode=3 target=' + this.channelid + ' msg=' + msg);
        }
        // bot not connected, but autoconnect is active and callback is given
        else if (this.connectionState != 1 && this.autoconnect) {
            this.Connect(false, () => this.bot.send('sendtextmessage targetmode=3 target=' + this.channelid + ' msg=' + msg));
        }
    }

    // Send a Text Message to the current Bot Channel
    // URLS need ro be fixed beforehand using Utils.fixUrlToTS3
    SendChannelMessage(msg) {
        // prep msg
        msg = this.escapeStr(msg);
        if (this.connectionState == 2) {
            this.bot.send('sendtextmessage targetmode=2 target=' + this.sid + ' msg=' + msg);
        }
        // bot not connected, but autoconnect is active and callback is given
        else if (this.connectionState != 1 && this.autoconnect) {
            this.Connect(false, () => this.bot.send('sendtextmessage targetmode=2 target=' + this.sid + ' msg=' + msg));
        }
    }

    // Send a Text Message to the given user (case sensitive)
    SendPrivateMessage(user, msg) {
        if (this.bot != null) {
            msg = this.fixUrlToTS3(msg);
            this.bot.send('clientfind pattern=' + escape(user), function () {
                // TODO target?
                this.bot.send('sendtextmessage targetmode=3 target=1 msg=' + this.escapeStr(msg));
            });
        }
    }


    /*
     * TELEGARM GROUP NOTIFICATION
     */

    // send a chatmessage from ts3 to all Telegram groups with the correct channel/chat mode
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
     * LIVETREE AREA
     */

    // returns all Child-channels of a given channel-id.
    GetChannelsBymain(id) {
        let res = [];
        for (let chn of this.channels) {
            if (chn.pid == id)
                res.push(chn);
        }
        return res;
    }

    // returns the given channeltree including users starting from root channel.
    // optionally bots can be ignored and child channels can be included with recursion.
    GetChannelTree(root, ignorebots, recursive, level) {
        let l = level;
        let childr = this.GetChannelsBymain(root);
        let userr = this.GetChannelUser(root, ignorebots);
        let chres = '';
        if (root == 0) {
            chres += this.serverinfo.virtualserver_name + ' (' + this.GetUserCount(ignorebots) + ' / ' + this.serverinfo.virtualserver_maxclients + ')';
        }
        else {
            // get channel object, flag & name
            let rootc = this.GetChannelById(root);
            let chanFlag = this.getChannelFlag(rootc);
            chres += chanFlag + ' ' + rootc.channel_name;
            // include users in channel
            if (userr.length > 0) {
                chres += ' [' + userr.length + ']';
                for (let usr in userr) {
                    // get user object & check bot
                    let user = userr[usr];
                    let isbot = user.client_type == 1;
                    if (isbot && ignorebots) continue;
                    // get user flag, name & id
                    let audioFlag = this.getUserAudioFlag(user);
                    let bName = this.fixNameToTelegram(user.client_nickname);
                    let dbid = isbot ? '' : ' ₍' + Utils.getNumberSmallASCII(user.client_database_id) + '₎';
                    chres += '\r\n  ' + audioFlag + ' ' + bName + dbid;
                }
            }
        }
        // recursive downwards call
        if (root == 0 || recursive) {
            for (let chil in childr) {
                let child = childr[chil];
                let cmsg = this.GetChannelTree(child.cid, ignorebots, recursive, ++level);
                chres += '\r\n' + cmsg.split('\r\n').join('\r\n  ');
            }
        }
        // final spacer processing
        if (l == 0) {
            let longest = this.longestRow(chres);
            if (longest > 38) {
                chres = chres.replace('  ', ' ');
            }
            chres = this.fixSpacers(chres);
        }
        // done with this level
        return chres;
    }

    // returns the current server tree and calls the update if its different from the last one sent to chat
    GetServerTree(cobj, callback, isError) {
        let msgs = Utils.getLanguageMessages(cobj.language);
        let currenttree = this.GetChannelTree(0, cobj.ignorebots, true, 0);
        let msg = msgs.liveTreeFormat;
        if (isError || !cobj.lasttree || cobj.lasttree != currenttree) {
            cobj.lasttree = currenttree;
            msg = msg.replace('<time>', isError ? msgs.liveTreeError : Utils.getTime());
            msg = msg.replace('<tree>', currenttree);
            callback(msg);
        }
    }

    // will try to update the tree in the given chat.
    UpdateLiveTree(tree, error) {
        let cobj = tree > 0 ? Utils.getUser({ id: tree }) : Utils.getGroupLinking(tree);
        if (!cobj || !cobj.language) {
            console.log('Critical: cant find chat object for live tree: ' + JSON.stringify([tree, cobj]));
            return;
        }

        this.GetServerTree(cobj, text => {
            //console.log('tree: ' + text);
            let opt = {
                parse_mode: 'html'
            };
            if (cobj.livetree) {
                console.log('Update tree: ' + cobj.livetree);
                opt.chat_id = tree;
                opt.message_id = cobj.livetree;
                this.main.bot.editMessageText(text, opt);
            }
            else {
                this.main.bot.sendMessage(tree, text, opt).then(msg => {
                    cobj.livetree = msg.message_id;
                    console.log('New tree: ' + cobj.livetree);
                });
            }
        }, error);
    }

    // will try to update all livetress for this instance.
    UpdateLiveTrees(error) {
        for (let lt in this.trees) {
            let tree = this.trees[lt];
            this.UpdateLiveTree(tree, error);
        }
    }

    // will add a new livetree to the chat or force it to update.
    AddLiveTree(chatId) {
        let index = this.trees.indexOf(chatId);
        if (index < 0) this.trees.push(chatId);
        let cobj = chatId > 0 ? Utils.getUser({ id: chatId }) : Utils.getGroupLinking(chatId);
        this.WrapAutoConnect(cobj.language, (msg) => {
            // respond for livetree autoconnect will
            this.main.bot.sendMessage(chatId, msg, {
                parse_mode: 'html'
            });
        }, () => this.UpdateLiveTree(chatId));


        // TODO send info message
    }

    // will remove an existing livetree (delete msg & stop updates)
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


    /*
     *  PING / UPDATER
     */

    // Function for pinging the server to prevent timeouts
    RunPing(self) {
        if (self.connectionState == 2) {
            //console.log(self.name + ' | Updating Channels & Users...');
            // update channels (e.g channel name change)
            self.bot.send('channellist', '-topic -flags -voice')
                .then(channeldata => {
                    self.channels = self.formatData(channeldata);
                })
                .then(() => self.bot.send('clientlist', '-uid -away -voice -times'))
                .then(clientdata => {
                    self.users = self.formatData(clientdata);
                    // trigger tree update, will only fire when change is detected .
                    self.UpdateLiveTrees();
                }).catch(err => {
                    self.connectionErr = JSON.stringify(err);
                    console.log('Ping Err: ' + self.connectionErr);
                    if (self.autoconnect) {
                        self.connectTry = 0;
                        self.Disconnect(true);
                    }
                    else self.Disconnect(false, true);
                });
        }
        else self.KillPing();
    }

    // stop updating the server info, deletes the interval.
    // usually called on error/Disconnect
    KillPing() {
        let self = this;
        if (self.pingInterval) {
            //console.log(self.name + ' | Instance not connected. Stopping updater...');
            clearInterval(self.pingInterval);
            self.pingInterval = null;
        }
    }


    /*
     *  STRING UTILITIES
     */

    // returns the longest's row length of a text
    longestRow(str) {
        if (!str.match('\r\n')) return str.length;
        return str.split('\r\n').sort((a, b) => b.length - a.length)[0].length;
    }

    // returns the adequate channel flag
    getChannelFlag(channel) {
        if (channel.channel_flag_default == 1) return "🏠";
        if (channel.channel_flag_password == 1) return "🔒";
        return "💬";
    }

    // returns the adequate user audio flag
    getUserAudioFlag(user) {
        if (user.client_type == 1) return '🤖';
        if (user.client_away == 1) return this.getClockEmoji(user.client_idle_time);
        if (user.client_output_muted == 1) return '🔇';
        if (user.client_input_muted == 1) return '🤐';
        if (user.client_is_recording == 1) return '🔴';
        if (user.client_is_channel_commander == 1) return '⭐️';
        if (user.client_is_priority_speaker == 1) return 'Ⓜ️';
        return '🔵';
    }

    // returns the clock emoji closest to the given (idle) time
    getClockEmoji(timeSpan) {
        let a = new Date(timeSpan);
        let d = ~~(a.getHours() % 12 * 2 + a.getMinutes() / 30 + .5);
        d += d < 2 ? 24 : 0;
        return String.fromCharCode(55357, 56655 + (d % 2 ? 23 + d : d) / 2);
    }

    // Function that excludes the [spacer] strings from channel names
    fixSpacer(str) {
        return String(str).replace(/(\[\*{0,1}[l,r,c]{0,1}spacer[0-9]{0,}\])/g, '');
    }

    // Function that actually fixes the [spacer] strings from channel names
    fixSpacers(str) {
        // get longest row's length
        let longest = this.longestRow(str);

        // left spacers will be displayed like normal channels but without Icon in front
        // the icon will be captured in the following regex and removed.
        let noLSpacer = String(str).replace(/(.*\[\*{0,1}lspacer[0-9]{0,}\])/g, '');

        // fix right and center spacers
        let spacers = [...noLSpacer.matchAll(/(.*\[\*{0,1}[c,r]{1}spacer[0-9]{0,}\])(.*)/g)];
        for (let spacer of spacers) {
            // 0=wohle match, 1=1st capture group 2=2nd capture group etc.
            let txt = spacer[2].trim();
            // get amount of spaces for correct positioning
            let spaceCnt = longest - txt.length;
            // if center, not right divide by 2
            if (spacer[1].match('cspacer')) spaceCnt /= 2;
            // rebuild and replace the old row
            // ~~ = math.floor after divide
            let realRow = this.getSpaces(~~spaceCnt) + txt;
            noLSpacer = noLSpacer.replace(spacer[0], realRow);
        }

        // fix repeating spacers
        // => *spacer is same as spacer
        let repeating = [...noLSpacer.matchAll(/(.*\[\*{0,1}spacer[0-9]{0,}\])(.*)/g)];
        for (let repeat of repeating) {
            // 0=wohle match, 1=1st capture group 2=2nd capture group etc.
            let txt = repeat[2].trim();
            // rebuild and replace the old row
            let realRow = txt;
            while (realRow.length < longest) realRow += txt;
            if (realRow.length > longest) realRow = realRow.substring(0, longest - 1);
            noLSpacer = noLSpacer.replace(repeat[0], realRow);
        }
        // done
        return noLSpacer;
    }

    // function to return given amount of spaces
    getSpaces(count) {
        let sp = '';
        for (let i = 0; i < count; i++) sp += ' ';
        return sp;
    }

    // fix ip address leak for ts3 bot names
    fixNameToTelegram(str) {
        let ip = str.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\:?([0-9]{1,5})?/);
        if (ip) {
            if (typeof ip == typeof []) {
                for (let i = 0; i < length(ip); i++)
                    str = str.replace(ip[i], '[IP]');
            }
            else str = str.replace(ip, '[IP]');
        }
        return str;
    }

    // removes [URL]-Tags from links
    fixUrlToTelegram(str) {
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

    // teamspeak3 library is using parameter arrays since all data fields
    // are always sent per object and it uses a little bit less memory.
    // Its however not very practical to sort or work with.
    // This function reformats the given data to object arrays..
    // from:  parameter array object {'a':['1','4'],'b':['2','5'],'c':['3','6']}
    // to:    object array           [{'a':'1','b':'2','c':'3'},{'a':'4','b':'5','c':'6'}]
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
