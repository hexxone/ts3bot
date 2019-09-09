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
    available: 3, 
    groupperm: false,
    needslinking: false,
    needsselected: false,
    usage: '/lol',
    description: 'lol',
    callback: function (main, ctx) {
        let ix = parseInt( Math.random() * (main.lolcurses.length - 1) );
        ctx.respondChat('League of ' + main.lolcurses[ix], ctx.opt);
    }
};