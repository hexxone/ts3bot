# ts3bot
Telegram to TS3 Bot

Author: Hexxon

1. git clone https://github.com/Hexxonite/ts3bot.git
2. npm install
3. copy sample.config.js => config.js
4. edit bot_token & developer_id
5. npm start

# How do I ..?

If you want to understand and improve or extend the bot I recommend first reading the config comments.
Next you could take a look at the 'src/commands/aaa_sample.js' file which should explain how commands work.
Going on, the code is mostly commented but you'll have to work yourself through it.
I won't be accepting any issues regarding setup or installation at this point.

# Features

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
