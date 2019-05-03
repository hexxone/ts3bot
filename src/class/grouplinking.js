"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

// represents a binding of a ts3 server to a Telegram group.
class GroupLinking {

    constructor(name, instance) {
        // reference to main
        this.main = instance.main;

        // data to be exported when saving
        this.name = name;
        this.instance = instance;
        this.groupid = 0;
        this.silent = false;
        this.notifyjoin = true;
        this.notifymove = 1; // 0 = off | 2 = channel | 3 = global
        this.chatmode = 0; // 0 = off | 2 = channel | 3 = global

        this.ignorebots = true;
        this.showservername = true;
        this.showgroupname = true;
        this.spamcheck = true;
        this.alladmin = false;
        this.pm = false;
        this.language = 'Eng';
        this.sharemedia = true;
        
        // dont export

        this.users = [];
    }

    Export() {
        let userids = [];
        for (let usr of this.users) userids.push(usr.id);
        return {
            name: this.name,
            instance: {
                id: this.instance.id,
                name: this.instance.name
            },
            groupid: this.groupid,
            silent: this.silent,
            notifyjoin: this.notifyjoin,
            notifymove: this.notifymove,
            chatmode: this.chatmode,
            ignorebots: this.ignorebots,
            showservername: this.showservername,
            showgroupname: this.showgroupname,
            spamcheck: this.spamcheck,
            alladmin: this.alladmin,
            pm: this.pm,
            language: this.language,
            sharemedia: this.sharemedia,
            userids: userids,
        };
    }

    // real init when added to group via link
    Link(groupid) {
        this.groupid = groupid;
        this.instance.AddGroup(groupid);
    }

    // destroy on /unlink or /delete
    Unlink() {
        this.instance.RemoveGroup(this.groupid);
    }

    // add user to virtual group when he sends a message in it
    CheckAddUser(userObj) {
        //console.log("CheckAddUser: " + userObj.id);
        if(!this.HasUser(userObj)) this.users.push(userObj);
    }

    // check if group contains a user
    HasUser(userObj) {
        for(let usr in this.users) {
            if(usr.id == userObj.id) return true;
        }
        return false;
    }

    // removes user from group
    RemoveUser(userObj) {
        this.users = this.users.filter((val) => userObj.id != val.id);
    }

    // Sends a message to the server respecting chat mode and "show group name"-option
    // URLS need to be fixed beforehand using Utils.fixUrlToTS3
    NotifyTS3(group, msg) {
        if (this.showgroupname)
            msg = group + " | " + msg;
        if(this.chatmode == 2)
        	this.instance.SendChannelMessage(msg);
        else if(this.chatmode == 2)
        	this.instance.SendGlobalMessage(msg);
    }

    // Sends a mesage to the relating telegram group respecting the
    // .. "show server name"- and notification-settings
    NotifyTelegram(server, msg) {
        if (this.showservername && server) msg = "(" + server + ") " + msg;
        let oobj = { 'parse_mode': 'html' };
        if (this.silent) Object.assign(oobj, { 'disable_notification': true });
        this.main.bot.sendNewMessage(this.groupid, msg, oobj).catch((a,b,c) => {
            console.log("Error group send message: " + JSON.stringify([a.message,b,c]));
        });
    }
}

// export the class
module.exports = GroupLinking;