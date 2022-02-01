# @TS3Bot

**This bot can link your TeamSpeak3-server to Telegram-groups for customizable cross-chat & notifications.**

Code is written in TypeScript and deployed using docker-compose.
_Author: hexxone_

## Requirements

- docker & compose

## Setup

NOTE: at this point I won't help with any issues regarding setup or installation.

1. `git clone https://github.com/hexxone/ts3bot.git`
2. `cd ts3bot && cp bot-variables.env .env && nano .env`
3. edit **bot_token** & **developer_id**, then save & quit
4. `docker-compose up -d`

## Language

If you wish, You can create your own language file.
Just copy: `src/msg/msg_en.js` to e.g.: `src/msg/msg_it.js` (for italian)
and translate all the strings (using deepl or google?).

Feel free to open Pull-Requests with new and/or fixed translations :)

## Customization

If you want to understand and improve or extend the bot I recommend first reading the "config" comments and further digging your way through it.
The code is mostly commented => Hence no documentation :)

Here is the general structure:

- COMMANDS

    create your own commands functions by placing a new \*.js
    file into the `/commands/` folder. Take a look at this file:
    `src/commands/aaa_sample.js`

- ACTIONS

    are usually text-inputs, needed for account setup etc., which can't be done inline.
    You find them in `src/action/`

- CLASSES

    if you think you need an additional static classes or functions,
    feel free to add a new class here: `src/class/`

## Features

(not in particular order):

- Multilanguage Support (Eng, Ger)
- Easy to use Inline Menu navigation
- Every user can add up to five TS3 Servers being watched
- Customize the Bot Display name and channel to join
- Link a group to a server, and a server to multiple groups!
- Each group will have its own notification and language settings (e.g. have a "User" and "Admin" Group)
- Get fully customizable Join, Leave, & Channel Switch notifications
- Bots can be ignored when listing users or showing Notifications
- Livetree will show the channels & clients like the ts3 client as live updated message (NEW)
- List all online users per channel
- Cross Chat in both directions can be set to Server, Channel or Off
- Group or Server names can be displayed in front of messages
- Telegram User Names in TS3 chat will be clickable with a link to their Profile
- TS3 User DB id will be included in messages sent to Telegram to ensure identity
- Media files from Telegram can be shared to TS3 in form of a link to download
- Silent mode wont send a notification when sending a message to a group
- Auto connect will try to stay connected at all times (will also reconnect after error or restart)
- Spam checker can avoid sending too much messages to TS3 (even bots can get banned for spam)
- "Admin 4 All" will allow all users in a group to change the settings (Admin Group?)
- Easy to add languages, commands and response actions
- Automatic reload of language, command and action files when running
- FAQ, Help, Stats, DevMessage
