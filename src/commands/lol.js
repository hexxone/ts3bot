"use strict";

//  
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//  

let Utils = require('../class/utils.js').Get();

module.exports = {
    id: 199,
    hidden: true,
    command: ["/lol"],
    available: 3, // available group, 0 = admin, 1 = single chat, 2 = group, 3 = chat & group
    groupperm: false, // group permission, if(available=2|3) and set true, command can only be used by admin
    needslinking: false, // the command requires the group to have a linked instance (available 2|3)
    needsselected: false, // the command requires the sender to have an instance selected (available 1|3)
    usage: '/lol', // command usage (including arguments)
    description: 'lol', // language bundle description
    callback: function (main, ctx) {
        let ix = parseInt( Math.random() * (main.lolcurses.length - 1) );
        ctx.respondChat('League of ' + main.lolcurses[ix], ctx.opt);
    }
};