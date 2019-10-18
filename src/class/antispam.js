'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

class AntiSpam {
    constructor(maxper20) {
        // always initialize all instance properties
        this.maxper20 = maxper20;
        this.register = [];
        console.log('AntiSpam active! Max rate: ' + maxper20 + ' msg / 10 sec');
    }

    // will add an timestamp with the user per sent message
    // if the ratio is above max, antispam measures are taken.
    CheckRegisterSpam(user) {
        this.register.push({ date: new Date(), usrid: user.id });
        let last = this.register.filter(function (reg) {
            if (reg.usrid == user.id) {
                let timeDiff = Math.abs(new Date().getTime() - reg.date.getTime());
                let diffSecs = Math.ceil(timeDiff / 1000);
                return diffSecs <= 10;
            }
            return false;
        });
        if (last.length > this.maxper20) { // is Spam!
            user.spams++;
            user.banneduntil = new Date(new Date().getTime() + (user.spams * user.spams * 5 * 60 * 1000)); // ban time = user.spams^2 * 5 minutes
            return true;
        }
        return false;
    }
}

// export the class
module.exports = AntiSpam;