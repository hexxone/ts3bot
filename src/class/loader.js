'use strict';

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

const FS = require('fs');
const Crypto = require('crypto');
const CircularJSON = require('circular-json');

const Algorithm = 'aes-256-cbc';

const Utils = require('./utils.js').Get();

const utils = {
    // fills Mathods.Parent with a reference to main.js (users, groups, etc)
    Get: function (self) {
        if (self) this.Methods.Parent = self;
        return this.Methods;
    },
    // contains the real utils
    Methods: {
        // load stored bot data from json
        loadData: function (t) {
            // set or get telegram api key
            let s = this.Parent.telegram_bot_token.split(':');
            // file name is "bot id" of api key
            let filePath = './data/bot_' + s[0] + '.stor';
            // File exists?
            if (!FS.existsSync(filePath)) {
                console.log("DataFile doesnt exist... Cant load");
                return;
            }
            let objj = {};
            try {
                // generate hash of api key part
                let hash = Crypto.createHash('md5').update(s[1], 'utf8').digest('hex').toUpperCase();
                // read file content
                let crypted = FS.readFileSync(filePath).toString().split("|");
                // first part is hex'd IV
                let iv = Buffer.from(crypted[0], 'hex');
                // create Decipher with Hash & IV
                let decipher = Crypto.createDecipheriv(Algorithm, hash, iv);
                // decrypt & finalize data
                let data = decipher.update(crypted[1], 'hex', 'utf8') + decipher.final('utf8');
                // parse to object
                objj = CircularJSON.parse(data);
                // debug print
                //console.log("Data: " + data);
            } catch (err) {
                console.log("loadData Error: " + JSON.stringify(err));
                return;
            }
            // Apply values
            if (objj.fileMappings) this.Parent.fileMappings = objj.fileMappings;
            if (objj.announces) this.Parent.announces = objj.announces;
            this.Parent.receivedMessages = parseInt(objj.msgcnt);
            this.Parent.users = [];
            objj.users.forEach((usr) => {
                let usrr = new User(usr.id, usr.username, usr.first_name, usr.last_name, usr.menu, usr.selected, usr.agreement);
                usrr.sentdev = usr.sentdev;
                usrr.spams = usr.spams;
                usrr.banneduntil = usr.banneduntil;
                usrr.language = usr.language;
                usrr.last_msg_id = usr.last_msg;
                usrr.last_bot_msg_id = usr.last_bot_msg_id;
                this.Parent.users.push(usrr);
            });
            this.Parent.instances = [];
            objj.instances.forEach((inst) => {
                let instt = new Instance(this.Parent, inst.id, inst.name);
                instt.groups = inst.groups;
                instt.qname = inst.qname;
                instt.qpass = inst.qpass;
                instt.addr = inst.addr;
                instt.qport = inst.qport;
                instt.sid = inst.sid;
                instt.clientname = inst.clientname;
                instt.channelname = inst.channelname;
                instt.channeldepth = inst.channeldepth;
                instt.autoconnect = inst.autoconnect;
                instt.greetmode = inst.greetmode;
                instt.greetmsg = inst.greetmsg;
                this.Parent.instances.push(instt);
            });
            this.Parent.linkings = [];
            objj.linkings.forEach((lnk) => {
                let instts = Utils.getUserInstances(lnk.instance.id);
                let instt = Utils.getArrayObjectByName(instts, lnk.instance.name);
                let lnkk = this.createLinkingFromData(instt, lnk);
                this.Parent.linkings.push(lnkk);
            });
            this.Parent.deeplinking = new Map();
            objj.deeplinking.forEach((keyset) => {
                let v = keyset.v;
                let instts = Utils.getUserInstances(v.instance.id);
                let instt = Utils.getArrayObjectByName(instts, v.instance.name);
                let lnkk = this.createLinkingFromData(instt, v);
                this.Parent.deeplinking.set(keyset.k, lnkk);
            });
            this.Parent.groupnames = new Map();
            objj.groupnames.forEach((keyset) => {
                this.Parent.groupnames.set(keyset.k, keyset.v);
            });
            console.log("Data successfully decrypted & loaded.");
        },
        // store bot data in json
        saveData: function () {
            // Create root object
            let objj = {
                msgcnt: this.Parent.receivedMessages,
                fileMappings: this.Parent.fileMappings,
                announces: this.Parent.announces,
                users: [],
                instances: [],
                linkings: [],
                deeplinking: [],
                groupnames: [],
            };
            // Export Users, Instances and Linkings
            this.Parent.users.forEach((usr) => objj.users.push(usr.Export()));
            this.Parent.instances.forEach((inst) => objj.instances.push(inst.Export()));
            this.Parent.linkings.forEach((lnk) => objj.linkings.push(lnk.Export()));
            this.Parent.deeplinking.forEach((val, key) => objj.deeplinking.push({ k: key, v: val.Export() }));
            this.Parent.groupnames.forEach((val, key) => objj.groupnames.push({ k: key, v: val }));
            // safe-parse data structure to string
            let txtt = CircularJSON.stringify(objj);
            // get telegram api key
            let s = this.Parent.telegram_bot_token.split(':');
            // hash of api key is used as password
            let hash = Crypto.createHash('md5').update(s[1], 'utf8').digest('hex').toUpperCase();
            // generate random IV
            let iv = Crypto.randomBytes(16);
            // create 256bit Cipher with hash & IV
            let cipher = Crypto.createCipheriv(Algorithm, hash, iv);
            // encrypt data from utf => hex
            let crypted = cipher.update(txtt, 'utf8', 'hex') + cipher.final('hex');
            // file path = bot id of api key string
            let filePath = './data/bot_' + s[0] + '.stor';
            // save
            FS.writeFileSync(filePath, iv.toString('hex') + "|" + crypted);
            console.log("Data successfully encrypted & stored.");
        },
        // loads user actions, commands and language modules
        loadModules: function () {
            this.loadFolder(this.Parent.actionsPath, this.Parent.actions, " actions.");
            this.loadFolder(this.Parent.commandsPath, this.Parent.commands, " commands.");
            this.loadFolder(this.Parent.languagesPath, this.Parent.languages, " languages.");
        },
        // loads a folder's modules
        loadFolder: function (folder, array, strAppend) {
            let self = this;
            let cnt = 0;
            array.length = 0; // reset array, but keep reference
            FS.readdirSync(folder).forEach((file, i, arr) => {
                let mod, fp = folder + "/" + file;
                if (mod = self.loadModule(array, fp))
                    console.log("Loaded: " + mod.id + " | " + fp);
                if (++cnt == arr.length)
                    console.log("Done loading " + cnt + strAppend);
            });
        },
        // auto reload modules
        watchModules: function () {
            this.watchFolder(this.Parent.actionsPath, this.Parent.actions);
            this.watchFolder(this.Parent.commandsPath, this.Parent.commands);
            this.watchFolder(this.Parent.languagesPath, this.Parent.languages);
        },
        // temporarily blocked filenames for change
        blocked: [],
        // wrapper for only triggering an event for a file once in 25 ms
        wch: function (self, fn) {
            return (event, path) => {
                if (!path || path in self.blocked) return;
                self.blocked[path] = true;
                setTimeout(() => delete self.blocked[path], 100);
                fn(event, path);
            }
        },
        // will watch a single folder for changes and trigger a callback
        watchFolder: function (folder, array) {
            let self = this;
            FS.watch(folder, this.wch(self, (event, filename) => {
                if (filename && filename != "undefined") {
                    let mod, fp = folder + "/" + filename;
                    if (mod = self.loadModule(array, fp))
                        console.log("Reloaded: " + mod.id + " | " + fp);
                }
            }));
        },
        // (re) loads a single module by clearing cache and array entry (determined by unique id property by object)
        loadModule: function (array, file) {
            try {
                delete require.cache[require.resolve(file)];
            } catch (ex) {
                console.log("Couldnt remove from require cache (new file?): " + ex);
            }
            try {
                // require & find module
                let mod = require(file);
                let ix = -1;
                array.forEach(function (obj, i, arr) {
                    if (obj.id === mod.id) ix = i;
                });
                // replace or insert module
                if (ix >= 0) array[ix] = mod;
                else array.push(mod);
                return mod;
            } catch (ex) {
                console.log("Couldnt load module: " + ex);
            }
            return null;
        },
        // will create a grouplinking from given object params
        createLinkingFromData(instt, lnk) {
            let lnkk = new GroupLinking(lnk.name, instt);
            lnkk.groupid = lnk.groupid;
            lnkk.silent = lnk.silent;
            lnkk.notifyjoin = lnk.notifyjoin;
            lnkk.notifymove = lnk.notifymove;
            lnkk.chatmode = lnk.chatmode;
            lnkk.ignorebots = lnk.ignorebots;
            lnkk.showservername = lnk.showservername;
            lnkk.showgroupname = lnk.showgroupname;
            lnkk.spamcheck = lnk.spamcheck;
            lnkk.alladmin = lnk.alladmin;
            lnkk.pm = lnk.pm;
            lnkk.language = lnk.language;
            lnkk.sharemedia = lnk.sharemedia;
            lnkk.last_bot_msg_id = lnkk.last_bot_msg_id;

            for (let usrid of lnk.userids)
                for (let usrr of this.Parent.users)
                    if (usrid == usrr.id)
                        lnkk.CheckAddUser(usrr);

            return lnkk;
        },
    }
};

module.exports = utils;

// circular reference ..
const User = require('./user.js')
const Instance = require('./instance.js');
const GroupLinking = require('./grouplinking.js');