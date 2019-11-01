'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Process = require('process');

const urlRegex = require('url-regex');

const utils = {
    // fills Mathods.Parent with a reference to main.js (users, groups, etc)
    Get: function (self) {
        if (self) this.Methods.Parent = self;
        return this.Methods;
    },
    // contains the real utils
    Methods: {
        // 'this' of main.js (instanciated on run)
        Parent: null,
        // returns a number with leading 0 if < 10
        get2Dig: function (num) {
            return num == 0 ? '00' : (num && num < 10 ? '0' + num : num);
        },
        // Time helper
        getTime: function () {
            let d = new Date();
            return [
                d.getFullYear(),
                this.get2Dig(d.getMonth() + 1),
                this.get2Dig(d.getDate())
            ].join('-') + ' ' + [
                this.get2Dig(d.getHours()),
                this.get2Dig(d.getMinutes()),
                this.get2Dig(d.getSeconds())
            ].join(':');
        },
        // Returns a User Object with the given id
        // (creates and adds it to existing users if not already in)
        getUser: function (tg_user) {
            if (!tg_user) return null;
            for (let user of this.Parent.users)
                if (user.id == tg_user.id) {
                    if (tg_user.username && user.username != tg_user.username) {
                        console.log('Update username: ' + tg_user.id);
                        user.username = tg_user.username;
                    }
                    if (tg_user.first_name && user.first_name != tg_user.first_name) {
                        console.log('Update first_name: ' + tg_user.id);
                        user.first_name = tg_user.first_name;
                    }
                    if (tg_user.last_name && user.last_name != tg_user.last_name) {
                        console.log('Update last_name: ' + tg_user.id);
                        user.last_name = tg_user.last_name;
                    }
                    return user;
                }
            console.log('New User: ' + tg_user.id);
            let newUser = new User(tg_user.id, tg_user.username, tg_user.first_name, tg_user.last_name, '', '', false);
            newUser.language = this.Parent.defaultLanguage;
            this.Parent.users.push(newUser);
            return newUser;
        },
        // Gets all the Instance the User with the given id owns
        getUserInstances: function (id) {
            let res = [];
            for (let instance of this.Parent.instances) {
                if (instance.id == id)
                    res.push(instance);
            }
            return res;
        },
        // Gets all the Linkings the User with the given id has
        getUserLinkings: function (id) {
            let res = [];
            for (let linking of this.Parent.linkings) {
                if (linking.instance.id == id)
                    res.push(linking);
            }
            return res;
        },
        // Finds a Linking for a group with the given id
        // (or null if not found)
        getGroupLinking: function (groupid) {
            for (let linking of this.Parent.linkings) {
                if (linking.groupid == groupid)
                    return linking;
            }
            return null;
        },
        // Finds Instances and Linkings from Object Array by Name
        getArrayObjectByName: function (arr, name) {
            for (let instance of arr)
                if (instance.name.toLowerCase() == name.toLowerCase())
                    return instance;
            return null;
        },
        // returns statistics string, param s is messages.
        getStats(s) {
            let msg = '';
            msg += s.stats01 + this.Parent.startDate;
            msg += s.stats02 + this.Parent.receivedMessages;
            msg += s.stats03 + this.Parent.users.length;
            msg += s.stats04 + this.Parent.groupnames.size;
            msg += s.stats05 + this.Parent.instances.length;
            msg += s.stats06 + this.Parent.linkings.length;
            let ts3users = 0;
            for (let linking of this.Parent.linkings) {
                if (linking.instance.connectionState == 2) {
                    ts3users += linking.instance.users.length;
                }
            }
            msg += s.stats07 + ts3users;
            const used = Process.memoryUsage().heapUsed / 1024 / 1024;
            msg += s.stats08 + Math.round(used * 100) / 100 + ' MB';
            return msg;
        },
        // Regex tests a String meant to be a name
        testName: function (name) {
            return name.match(/^[a-zA-Z0-9]{2,32}$/) !== null;
        },
        // returns messages-object for the desired language
        getLanguageMessages: function (lang) {
            let deff = null;
            for (let msgobj of this.Parent.languages) {
                if (msgobj.langCode == lang || msgobj.langName == lang)
                    return msgobj;
                if (msgobj.langCode == this.Parent.defaultLanguage)
                    deff = msgobj;
            }
            return deff;
        },
        // returns the file type string for a telegram message
        getMsgFileType: function (msg) {
            if (!msg) return null;
            let fileTypeArr = ['file', 'audio', 'document', 'photo', 'sticker', 'video', 'voice'];
            for (let ft of fileTypeArr)
                if (msg[ft])
                    return ft;
            return null;
        },
        // destroys a given group linking
        destroyGroupLinking: function (lnk, noGroupMsg) {
            // Remove Linking
            this.Parent.linkings = this.Parent.linkings.filter((linking) => {
                // Check if is this is the linking we want to destroy
                if (linking.instance.id != lnk.instance.id || linking.name != lnk.name)
                    return true;
                // Notify, Unregister and remove it
                let usr = this.getUser({ id: lnk.instance.id });
                let msgs = this.getLanguageMessages(usr.language);
                this.Parent.bot.sendNewMessage(usr.id, msgs.linkingDestroyed.replace('<linking>', linking.name));
                if (!noGroupMsg) {
                    let grp = this.getGroupLinking(linking.groupid);
                    let gmsgs = this.getLanguageMessages(grp.language);
                    this.Parent.bot.sendNewMessage(linking.groupid, gmsgs.serverUnlinked);
                }
                linking.Unlink();
                return false;
            });
        },
        // removes the keyboard and overwrites the response function 
        fixRemoveKeyboard: function (main, ctx) {
            let cid = ctx.chatId;
            main.bot.sendMessage(cid, '🕐...', { reply_markup: { remove_keyboard: true } })
                .then(data => main.bot.deleteMessage(cid, data.message_id));
        },
        // returns a command by its description name
        getCmdByDesc: function (desc) {
            let objs = this.Parent.commands.filter(function (obj) {
                return obj.description == desc;
            });
            if (objs.length == 1) return objs[0];
            return null;
        },
        // Get Command as Button
        getCmdBtn: function (desc, msgs) {
            if (desc == 'cancel') return {
                text: msgs['cmd_cancel'],
                callback_data: 'cc'
            };
            let obj = this.getCmdByDesc(desc);
            if (obj) return {
                text: msgs['cmd_' + desc],
                callback_data: 'c' + obj.id
            }
            else return {
                text: 'Error: ' + desc,
                callback_data: 'e'
            }
        },
        // Returns a Random string of desired length
        randomString: function (length) {
            let text = '';
            let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (let i = 0; i < length; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        },
        // Returns a bool if the given value is type of integer.
        isInt: function (value) {
            let x;
            return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
        },
        // returns whether the value indicates a positive meaning string
        isYes: function (value) {
            return ['1', 'an', 'jo', 'ein', 'einschalten', 'aktivieren', 'aktiviert', 'aktiv', 'on', 'yes', 'yep', 'true', 'enable', 'enabled', 'amk', 'fly'].includes(value.toLowerCase());
        },
        // returns whether the value indicates a negative meaning string
        isNo: function (value) {
            return ['0', 'aus', 'ausschalten', 'nö', 'deaktivieren', 'deaktiviert', 'inaktiv', 'off', 'no', 'nope', 'false', 'disable', 'disabled', 'meh', 'lame'].includes(value.toLowerCase());
        },
        // Doesnt need a comment, but OCD
        endsWith: function (hay, s) {
            return hay.length >= s.length && hay.substr(hay.length - s.length) == s;
        },
        // converts notify move mode (number) to string
        nmToStr: function (language, number) {
            let msgs = this.getLanguageMessages(language);
            switch (number) {
                case 1: return 'Channel';
                case 2: return 'Global';
                default: return msgs.optionOff;
            }
        },
        // converts chat mode (number) to string
        cmToStr: function (language, number) {
            let msgs = this.getLanguageMessages(language);
            switch (number) {
                case 2: return 'Channel';
                case 3: return 'Global';
                default: return msgs.optionOff;
            }
        },
        // converts connection state to language string
        stToStr: function (language, number) {
            let msgs = this.getLanguageMessages(language);
            switch (number) {
                case 1: return msgs.stateConnecting;
                case 2: return msgs.stateConnected;
                case 3: return msgs.stateError;
                default: return msgs.stateIdle;
            }
        },
        // converts available number to string
        avToStr: function (language, available) {
            let msgs = this.getLanguageMessages(language);
            switch (available) {
                case 0: return msgs.availableDev;
                case 1: return msgs.availableChat;
                case 2: return msgs.availableGroup;
                case 3: return msgs.availableAll;
            }
        },
        // trys to make a Telegram user name a clickable link
        tryNameClickable: function (userObj) {
            // make Telegram user clickable
            let tsname = userObj.GetName();
            if (tsname.startsWith('@'))
                tsname = '[URL=https://t.me/' + tsname.substring(1, tsname.length) + ']' + tsname + '[/URL]';
            return tsname;
        },
        // will surround urls with given TAG for being clickable TS3
        fixUrlToTS3: function (str) {
            // make urls clickable for ts3 clients
            let urll = str.match(urlRegex());
            if (urll) {
                if (typeof urll == typeof []) {
                    for (let i = 0; i < urll.length; i++)
                        str = str.replace(urll[i], '[URL]' + urll[i] + '[/URL]');
                }
                else str = str.replace(urll, '[URL]' + urll + '[/URL]');
            }
            return str;
        },
        // converts an 'int' to a string with lower cased numbers
        getNumberSmallASCII: function (num) {
            let narr = '₀₁₂₃₄₅₆₇₈₉'.split(''), res = '';
            let str = num.toString();
            for (let i = 0; i < str.length; i++) {
                let a = str.charAt(i);
                let x = parseInt(a);
                if (narr[x]) res += narr[x];
            }
            return res;
        },
        // returns available ts3 server for user
        getUserAvailableServers: function (user) {
            let servers = {};
            this.Parent.linkings.forEach(lnk => {
                if (lnk.pm && lnk.HasUser(user)) {
                    let key = lnk.instance.id + '_' + lnk.instance.name;
                    if (!servers[key]) servers[key] = lnk.instance;
                }
            });
            return servers;
        },
        // returns users of a ts3 server
        getServerAvailableUsers: function (instance) {

        }
    }
};

module.exports = utils;

// circular reference ..
const User = require('./user.js')
