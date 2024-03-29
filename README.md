# [@TS3Bot](https://t.me/TS3Bot)

[![Total alerts](https://img.shields.io/lgtm/alerts/g/hexxone/ts3bot.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/hexxone/ts3bot/alerts/)

## This bot may link your TeamSpeak3-server to Telegram-groups for customizable cross-chat & notifications

### Author: [hexx.one](https://hexx.one)

Code is written in TypeScript and deployed using docker-compose.

NOTE: at this point I won't help with any issues regarding setup or usage.

## Requirements

- docker && docker-compose

## Setup

.env:

```bash
BOT_TOKEN=123456:ABCDEFGHIJKKL
WEBHOOK=false
WEBHOOK_ADDR=bot.example.com
WEBHOOK_PORT=80
CUSTOM_CERT=false
FILE_PROXY=false
FILE_PROXY_PORT=8080
FILE_PROXY_ADDR=files.example.com
DEVELOPER_ID=12345678
DEBUG=false
LANGUAGE=Eng
MOTD_ID=1
MOTD_TXT=Hi, thanks for still using the bot!
```

docker-compose.yml:

```yaml
version: '2'
services:
    node_ts3bot:
        image: hexxone/telegram-ts3bot
        container_name: node_ts3bot
        hostname: node_ts3bot
        restart: unless-stopped
        ports:
            - 8443:80 # can be removed if not using webhook
            - 8080:8080 # can be removed if not using fileProxy
        volumes:
            - ./data:/app/data # bot settings storage directory
            - ./.env:/app/.env # all possible environment variables (change BOT_TOKEN !)
```

then

`docker-compose up -d`

## i18n

If you wish, You can create your own language file.

Just copy: `src/msg/msg_en.ts` to e.g.: `src/msg/msg_it.ts` (for italian)
and translate all the strings (using deepl.com or google?).

Feel free to open PR with new and/or fixed translations :)

## Customization

If you want to understand and improve or extend the bot I recommend first reading the "config" comments and further digging your way through it.
The code is mostly commented => Hence no documentation :)

Here is the general structure:

- ACTION

    are usually text-inputs, needed for account setup etc., which can't be done inline.
    You find them in `src/action/`

- CLASS

    if you think you need an additional static classes or functions,
    feel free to add them here: `src/class/`

- COMMAND

    create your own commands functions by placing a new \*.ts
    file into the `/command/` folder.
    Take a look at: `src/command/aaa_sample.ts`

- HANDLER

    are the functions which are called when a Telegram message is received.
    You find them in `src/handler/`

- MSG

    are the translations / languages which are used in the bot.
    You find them in `src/msg/`

- OBJECT

    are the objects which are used in the bot.
    You find them in `src/object/`

## Features

(not in particular order):

- Multilanguage Support `(Eng, Ger)`
- Easy to use Inline-button  Menu navigation
- Every user can `/add` up to 5 TS3 Servers being watched
- Customize the Bot `Display name` and `channel to join`
- `/Link` a server to multiple Telegram groups!
- Each group will have its own notification and language settings (e.g. have a "User" and "Admin" Group)
- Get customizable Join, Leave, & Channel Switch notifications
- Bots can be ignored when listing users or showing Notifications
- `/LiveTree` will show the channels & clients like the ts3 client as live updated message
- List all online `/users` per channel
- Cross Chat in both directions can be enabled
- Media files from Telegram can be shared & proxied to TS3 in form of a link to download
- Group / Server / Channel / Client names will be displayed in front of messages
- Telegram User Names in TS3 will be clickable with a link to their Profile
- TS3 User DB id will be included `₍₁₂₎` in messages sent to Telegram
- `/Silent` mode wont send a notification when sending a message to a group
- `/Autoconnect` will try to stay connected at all times & reconnect after errors
- Spam checker can avoid sending too much messages to TS3 (even bots can get banned for spam)
- `Admin 4 All` will allow all users in a group to change the settings (Admin Group?)
- `/commands` will show a list of all _actually available_ commands for the context
- Easy to add _languages_, _commands_ and response _actions_.
- `/FAQ`, `/Help`, `/Stats`

### LiveTree example

```text
Server Name (5 / 32)
==============================
         Entry Hall [1]
    🤖 otherbot
==============================
💬 Business
💬 Retirement home [2]
    🤐 Sattalit ₍₇₎
    🔇 SaaS ₍₃₎
💬 Movie
💬 Jobcenter
🔒 TopSecret
📍 Bottom Secret [1]
    🤖 TS3Bot
==============================
              AFK
💬 Eat
💬 Sleep [1]
    🔇 hexx.one ₍₁₁₎
==============================
Changed: 2077-12-24 13:37:42
```
