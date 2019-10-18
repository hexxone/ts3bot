'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

const Utils = require('../class/utils.js').Get();

module.exports = {
    id: 118,
    available: 3, 
    groupperm: false,
    needslinking: false,
    needsselected: false,
    usage: '/menu',
    description: 'menu',
    command: ['/menu'],
    callback: function (main, ctx) {
        Utils.fixRemoveKeyboard(main, ctx);
        let msgs = ctx.senderMessages;
        let msg = msgs.menu00 + '<code>';
        let ins = null;
        let kbarr = [];
        ctx.opt.reply_markup.remove_keyboard = true;
        if (ctx.isGroup) {
            // group has linked server
            if (ctx.groupBinding) {
                msgs = ctx.groupMessages;
                ins = ctx.groupBinding.instance;
                let iusr = Utils.getUser({ id: ins.id });
                // build message
                msg = msgs.menu00 + '<code>'
                    + msgs.menu01
                    + '\r\n' + msgs.langCurrent
                    + msgs.info01 + '</code><a href=\'tg://user?id=' + ins.id + '\'>' + iusr.GetName() + '</a><code>'
                    + msgs.info02 + ins.channeldepth
                    + msgs.info03 + (ins.groups.length - 1);
            }
            else {
                // print non specific info
                msg += '\r\n' + msgs.langCurrent
                    + msgs.menu02;
            }
        } else {
            // no keyboard in group
            ctx.opt.reply_markup.inline_keyboard = kbarr;
            kbarr.push([Utils.getCmdBtn('manage', msgs)]);
            // add 'settings'
            // user has selected server
            if (ins = ctx.senderSelectedInstance) {
                // build message
                kbarr[0].push(Utils.getCmdBtn('settings', msgs));
                msg += msgs.menu05 + ins.name
                    + msgs.info12 + ins.groups.length;
            }
            else {
                // print 'not selected' info
                msg += msgs.menu06;
                // can 'select server'?
                if (ctx.senderInstances.length > 0)
                    kbarr.push([Utils.getCmdBtn('select', msgs)]);
            }
        }
        // 'connected' command array
        let conArr = [];
        // instance?
        if (ins) {
            msg += '\r\n</code>--- --- --- --- --- --- --- ---<code>';
            msg += msgs.info20 + Utils.stToStr(msgs.langCode, ins.connectionState);
            // connected?
            if (ins.connectionState == 2) {
                // add 'users' command
                conArr.push(Utils.getCmdBtn('users', msgs));
                // add server infos
                msg += msgs.info21 + ins.serverinfo.virtualserver_name;
                msg += msgs.info22 + ins.serverinfo.virtualserver_platform;
                msg += msgs.info23 + ins.serverinfo.virtualserver_version.split(' ')[0];
                msg += msgs.info24 + ins.users.length + ' / ' + ins.serverinfo.virtualserver_maxclients;
                msg += msgs.info25 + ins.serverinfo.virtualserver_channelsonline;
            }
            // include admin keyboard for single chat
            if (!ctx.isGroup) {
                switch (ins.connectionState) {
                    case 2: conArr.push(Utils.getCmdBtn('reconnect', msgs));
                    case 1: conArr.push(Utils.getCmdBtn('disconnect', msgs));
                        break;
                    default: conArr.push(Utils.getCmdBtn('connect', msgs));
                        break;
                }
                kbarr.push(conArr); // add 'start'
            }
        }
        if (!ctx.isGroup)
            kbarr.push([Utils.getCmdBtn('start', msgs)]);
        msg += '</code>';
        // build message
        ctx.opt.parse_mode = 'html';
        ctx.respondChat(msg, ctx.opt);
    }
};