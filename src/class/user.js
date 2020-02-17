'use strict';

//
// Copyright (c) 2019 D.Thiele All rights reserved.  
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.  
//

// represents a bot user
class User {

    constructor(id, username, first_name, last_name,
        menu, selected, agreement) {
        // always initialize all instance properties
        this.id = id;
        this.username = username;
        this.first_name = first_name;
        this.last_name = last_name;
        this.menu = menu;
        this.selected = selected;
        this.agreement = agreement;

        this.sentdev = false;
        this.spams = 0;
        this.banneduntil = null;

        this.language = 'Eng';
        this.last_msg_id = null;
        this.last_bot_msg_id = null;

        // last server and user you received a msg from or selected
        this.pm_selected_srv = '';
        this.pm_selected_usr = '';

        // live tree
        this.livetree = null;
        this.lasttree = null;
        this.lasterror = null;

        // helper for selecting user on a server
        this.pm_select_usr_site = 0;
    }

    Export() {
        return {
            id: this.id,
            username: this.username,
            first_name: this.first_name,
            last_name: this.last_name,
            menu: this.menu,
            selected: this.selected,
            agreement: this.agreement,
            sentdev: this.sentdev,
            spams: this.spams,
            banneduntil: this.banneduntil,
            language: this.language,
            last_msg_id: this.last_msg_id,
            last_bot_msg_id: this.last_bot_msg_id,
            pm_selected_srv: this.pm_selected_srv,
            pm_selected_usr: this.pm_selected_usr,
            livetree: this.livetree,
            lasttree: this.lasttree,
            lasterror: this.lasterror
        };
    }

    // Returns the Username
    GetName() {
        if (this.username != null)
            return '@' + this.username;
        else {
            let n = this.first_name;
            if (this.last_name != null)
                n += ' ' + this.last_name;
            return n;
        }
    }
}

// export the class
module.exports = User;