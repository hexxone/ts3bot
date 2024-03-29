"use strict";

//
// Copyright (c) 2022 hexxone All rights reserved.
// Licensed under the GNU GENERAL PUBLIC LICENSE.
// See LICENSE file in the project root for full license information.
//

// Every language-related string / user-message
export default {
	id: 1001,
	langCode: "de",
	langName: "German",
	langFlag: "🇩🇪",
	langText: "Sprache auf Deutsch gestellt.",
	langNotFound: "Sprache nicht gefunden.",
	langCurrent: "Sprache:       Deutsch.",

	timeYears: "j",
	timeDays: "t",
	timeHours: "std",
	timeMins: "min",
	timeSecs: "sek",

	invalidName: "Ungültiger Name. Es dürfen keine Leer- oder Sonderzeichen verwendet werden.",
	invalidFormatSrv: "Ungültiges Format. Benutze: 'addresse|query_port|ts3_port'",
	invalidFormatAcc: "Ungültiges Format. Benutze: 'query_benutzer|query_passwort'",
	noInstSelected: "Kein Server gewählt",
	notLinked: "Es ist noch kein Server mit der Gruppe verbunden.",
	notAllowed: "Du hast keine Erlaubnis dazu.",
	useInGroup: "Benutze diesen Befehl in einer Gruppe mit einem verbundenem Server.",
	errorPrefix: "Unerwarteter Fehler: ",
	botDisconnected: "Bot wurde vom Server getrennt: ",
	channelLeave: "hat den Bot Channel verlassen.",
	channelJoin: "hat den Bot Channel betreten.",
	channelSwitch: "hat den Channel gewechselt:",
	notConnected: "Fehler: Bot ist nicht verbunden.",
	userOnline: " Benutzer:",
	connectError: "Konnte nach $attempts$ Versuch(en) nicht verbinden. Letzer Fehler: ",
	replyError: "Konnte Befehl nicht ausführen.",

	optionOn: "<code>An</code>",
	optionOff: "<code>Aus</code>",

	stateIdle: "Getrennt",
	stateConnecting: "Verbindet",
	stateConnected: "Verbunden",
	stateError: "Getrennt (Fehler)",

	availableDev: "für Entwickler",
	availableChat: "für Benutzer",
	availableGroup: "für Gruppen",
	availableAll: "für Benutzer und Gruppen",

	greetOnJoin: "<code>Channel Beitritt</code>",
	greetConnect: "<code>Verbindung</code>",
	greetMsg: "\r\nNachricht: ",

	groupJoin: " hat die Gruppe betreten.",
	groupLeave: " hat die Gruppe verlassen.",

	spamStart1: "Spam Schutz: Deine Nachrichten werden für $time$ Minuten ignoriert.",
	spamStart2: "Spam Schutz:\r\nWeil der Bot dich nicht erreichen konnte, bekommst du die Info hier:\r\nDeine Nachrichten werden für $time$ Minuten ignoriert.",
	spamEnd: "You are no longer ignored due to Spam. Next time you will be ignored for: $time$ minutes.",

	spamIgnoreTrigger: "Spam Schutz ausgelöst. Deine Nachrichten werden ignoriert für: ",
	spamIgnoreRevoke: "Du wirst nicht länger ignoriert. Dauer beim nächsten mal: ",

	noAgreement: "Bitte lies und bestätige die AGB's (/tos) bevor du einen Server hinzufügst.",
	addInfo:
		"Du wirst folgende Informationen benötigen:<code>\r\n- server Addresse\r\n- Query Port\r\n- Vserver ID\r\n- Query Benutzer</code>\r\nUm zu beginnen, nenne mir einen Namen für den Server (z.B.: jeff)",
	addLimit: "Du hast bereits 3 Server hinzugefügt. Wenn du diese nicht benötigst kannst du sie jederzeit löschen (/delete).",
	linkLimit: "Du hast bereits 5 Gruppen verlinkt. Wenn du diese nicht benötigst kannst du sie jederzeit löschen (/unlink).",
	admin4allOn: "Jeder ist jetzt ein Admin.",
	admin4allOff: "Admin-Rechte zurückgezogen.",
	availableCommands: "Verfügbare Befehle:",
	groupNotLinked: 'Diese gruppe ist mit keinem TS3 server verbunden.\r\nBenutze <code>/add</code> und <code>/link</code> im <a href="https://t.me/ts3bot?start">bot-chat</a>.',
	conConnect: "Verbindet. Bitte etwas Geduld...",
	conConnecting: "Bot verbindet noch. Zum abbrechen: /disconnect",
	conConnected: "Bot ist noch verbunden. Benutze stattdessen: /reconnect.",
	delConfirm: "Das löschen eines Servers betrifft auch alle verbundenen Gruppen.\r\nWenn du sicher bist tippe folgendes:\r\n\r\n",
	delConfirmStr: "Verstanden, lösche ",
	disconnect: "Verbindung wird getrennt...",
	faqText:
		"TS3Bot FAQ (Häufig gestellte Fragen):\r\nDu kannst einen Query Acount erstellen indem du ich zu deinem Server verbindest und dann in der Toolbar 'Extras > ServerQuery Login' auswählst.\r\n" +
		"Der Bot braucht folgende Berechtigungen um Ordnungsgemäß zu funktionieren:\r\n" +
		" - b_virtualserver_info_view\r\n - b_virtualserver_connectioninfo_view\r\n - b_virtualserver_channel_list\r\n" +
		" - b_virtualserver_client_list\r\n - b_virtualserver_notify_register\r\n - b_virtualserver_notify_unregister\r\n" +
		"Die User Namen & Channel werden nur alle 2 Minuten aktualisiert.\r\n" +
		"Dieser Bot wurde mit TypeScript realisiert.\r\n" +
		"Code: https://github.com/hexxone/ts3bot",
	helpText:
		"TS3Bot Hilfe:\r\nDieser Bot bietet ein Interface um TS3 Server" +
		" mit Telegram(-Gruppen) zu verbinden. Hauptzweck ist Cross-Chat und User Anzeige.\r\nDie TS3-Verbindung wird über" +
		" die offizielle Query API hergestellt und benötigt daher einen Account.\r\nBevor du diesen Bot benutzt, stimme bitte den /tos (Nutzungsbedingungen) zu.\r\nDu kannst einen Server mit /add hinzufügen.\r\n" +
		" Das Menü sollte Sie leiten, aber wenn Sie auf Fehler stoßen, sollten Sie die /faq lesen und den Bot nicht benutzen.",
	tosText:
		"TS3Bot TOS (Nutzungsbedingungen):\r\nDer Bot ist ein kostenloses, Hobbyprojekt und ich (der Entwickler) übernehme keine Haftung" +
		" für eventuelle Schäden am Nutzer oder anderen Parteien. Da dies ein kostenloser Service ist, besteht keine Garantie dafür dass er" +
		" immer online oder verfügbar ist. Es ist desweiteren verboten den Bot oder zugehörige Systeme sogenannten Stress-, Performance oder" +
		"'Sicherheits'-Tests zu unterziehen. Gegebenenfalls werden diese als DDoS gewertet und vom Provider verfolgt. Der Bot speichert gewisse Nutzerdaten verschlüsselt ab (zwischen neustarts).",
	tosAgree: "Um zuzustimmen, tippe bitte folgendes: '<code>$tos_string$</code>'",
	tosString: "Ich stimme zu",

	ignorebots: "Andere TS3 query clients werden ignoriert",
	unignorebots: "Andere TS3 query clients werden nicht mehr ignoriert.",

	addLink: "Bitte gib einen Namen für die Verlinkung ein:",

	accountSet: "Account Details gesetzt.",
	accBotName: " Als nächstes nenne mir bitte den Namen für den Bot auf deinem Server:",

	channelSet: "Channel Name gesetzt.",
	channelComplete: " Erstellen abgeschlossen. Du kannst nun:\r\n/link (Server mit Gruppe verlinken)\r\n/connect (Zum Server verbinden)\r\nOder die Einstellungen bearbeiten\r\n(siehe /settings)",
	channelNameErr: "Fehler: Der Name muss zwischen 2 und 32 Zeichen lang sein.",

	tosAccept: "Danke :)",
	tosReject: ":(",

	addedServer: "Server erstellt. Als nächstes bitte die Server Addresse in folgendem Format eingeben:\r\n'ip_oder_host|query_port|ts3_port'.",
	nameInUse: "Der Name ist bereits in Verwendung.",
	linkDestroyed: "Deep-link '$link$' wurde zerstört.",
	linkingDestroyed: "Gruppen-link '$linking$' wurde zerstört.",
	serverUnlinked: "Server-verlinkung mit Gruppe zerstört.",
	serverDeleted: "Server gelöscht.",
	deleteError: "Fehler. Achte auf Groß-und-Kleinschreibung.\r\n/cancel zum abbrechen",

	linkGroup: "Benutze nun den Link um den Bot einer Gruppe hinzuzufügen:",
	nameError: "Der Name darf keine Sonderzeichen enthalten.",
	serverSelected: "Server ausgewählt: ",
	serverNotFound: "Server nicht gefunden.",
	setName: "Bot-Name gesetzt.",
	setNameFirst: " Als nächstes bitte den exakten Namen des Channels eingeben, den der Bot betreten soll:",
	setServer: "Server Addresse gesetzt.",
	setServerFirst: " Als nächstes bitte die TS3 Query Account Daten in folgenden Format angeben:\r\n'query_user|query_password'.",
	linkingNotFound: "Diese Verlinkung existiert nicht.",
	groupAlreadyLinked: "Diese Gruppe ist bereits mit einem Server verlinkt.",
	groupLinked: "TS3 $server$ wurde erfolgreich mit der Gruppe verlinkt",
	invalidLink: "Fehler: Ungültiger Deeplink-Schlüssel.",
	startChat: "Hi! Dieser Bot verbindet deinen TeamSpeak3 Server mit Telegram Gruppen.",

	spamCheck: "Spam Check gesetzt: ",
	silentMode: "Stumm Modus gesetzt: ",

	groupNameHidden: "Gruppen Name wird in TS3 versteckt.",
	groupNameShown: "Gruppen Name wird in TS3 angezeigt",

	shareMediaOn: "Gesendete Medien werden in TS3 geteilt.",
	shareMediaOff: "Gesendete Medien werden nicht in TS3 geteilt.",

	usage: "Syntax: ",

	setServerAddress: "Bitte die Server Addresse in folgendem Format angeben: 'addresse|query_port|ts3_port'.",
	setBotName: "Bitte den Namen für den Bot auf dem Server eingeben:",

	setChatMode: "Chat Modus gesetzt: ",
	setChannelDepth: "Channel-Tiefe gesetzt: ",

	setChannelName: "Bitte den exakten Namen des Channels eingeben, den der Bot betreten soll:",
	setAccountDetails: "Bitte die TS3 Query Account Daten in folgenden Format angeben: '<query_user>|<query_passwd>'.",
	selectServer: "Tippe oder Schreibe den Namen des Servers den du auswählen willst.",
	serverReconnecting: "Verbindet erneut. Bitte etwas Geduld...",

	setMoveNotifications: "Client Move Benachrichtigungen gesetzt: ",
	setJoinNotifications: "Client Join Benachrichtigungen gesetzt: ",
	setGreetMode: "Client Begrüßung gesetzt: ",

	manageHeader: "Server und Gruppen:<code>",
	manageSelected: "(Ausgewählt)",
	manageFooter: "/unlink [link_name] zum löschen.",
	enableAutoConnect: "Bot wird automatisch (neu) verbinden.",
	disableAutoConnect: "Bot wird nicht automatisch (neu) verbinden.",
	noUsersOnline: "Niemand online.",
	autoConnecting: "Verbindet automatisch...\r\nEinen Moment bitte.",
	leftServer: "hat den Server verlassen.",
	joinedServer: "hat den Server betreten.",
	botConnected: "</b> ist nun verbunden.\r\n<b>$users$ Benutzer</b> und <b>$bots$ Bot(s)</b> online.",
	botChannelMsg: " halo I bims ein Nachrid vong Tesd",
	liveTreeFormat: "LiveTree\r\n<code>$tree$</code>\r\nGeändert: $time$",
	liveTreeError: " ⚠️",
	liveTreeStop: "LiveTree gestoppt.",
	liveTreeRefresh: 'LiveTree wurde manuell geupdated -> <a href="$url$">Nachricht</a>\r\nBenutze <code>/livetree stop</code> zum abbrechen.',

	menu00: "Menü:",
	menu01: "\r\nGruppe ist verlinkt.",
	menu02: "\r\nGruppe ist nicht verlinkt.",
	menu03: "\r\nServer:       ",
	menu04: "\r\nVerlinkungen: ",
	menu05: "\r\nAusgewählt:   ",
	menu06: "\r\nKein Server ausgewählt",

	info00: "Gruppe & Server:",
	info01: "\r\nBesitzer:     ",

	info10: "gewählter Server:",
	info11: "\r\nName:         ",
	info12: "\r\nGruppen:      ",

	info21: "\r\nStatus:       ",
	info22: "\r\nServer Name:  ",
	info23: "\r\nVersion:      ",
	info24: "\r\nPlattform:    ",
	info25: "\r\nOnline seit:  ",
	info26: "\r\nClients:      ",
	info27: "\r\nChannel:      ",

	settings00: "Gruppen & Server Einstellungen:",
	settings01: "\r\nAdmin für alle:  ",
	settings02: "\r\nChat Modus:      ",
	settings03: "\r\nTeile Medien:    ",
	settings04: "\r\nZeige Gruppe:    ",
	settings06: "\r\nIgnoriere Bots:  ",
	settings07: "\r\nLeise Modus:     ",
	settings08: "\r\nSpam Check:      ",
	settings09: "\r\nJoin Nachricht:  ",
	settings10: "\r\nMove Nachricht:  ",

	settings20: "Server Einstellungen:",
	settings21: "\r\nName:            ",
	settings22: "\r\nServer Addresse: ",
	settings23: "\r\nQuery Port:      ",
	settings24: "\r\nServer Port:     ",
	settings25: "\r\nQuery Benutzer:  ",
	settings26: "\r\nQuery PassWort:  ",
	settings27: "\r\nAnzeigename:     ",
	settings28: "\r\nChannel Name:    ",
	settings29: "\r\nChannel Tiefe:   ",
	settings30: "\r\nAuto Verbindung: ",
	settings31: "\r\nBegrüßung:       ",

	stats01: "\r\nletzter Neustart:  ",
	stats02: "\r\nBot Nachrichten:   ",
	stats03: "\r\nBot Benutzer:      ",
	stats04: "\r\nBot Gruppen:       ",
	stats05: "\r\nServer Instanzen:  ",
	stats06: "\r\nServer Gruppen:    ",
	stats07: "\r\nTS3 Benutzer z.Z:  ",
	stats08: "\r\nTS3bot RAM Verbr.: ",

	actionCommand: "Ungültige Antwort (Befehle sind nicht erlaubt).",
	actionCancel: "Aktion abgebrochen: ",
	actionNoCancel: "Nichts abzubrechen ¯\\_(ツ)_/¯",

	commandsGroup: "* = braucht Admin Rechte\r\n# = braucht Verlinkung\r\n",
	commandsChat: "~ = braucht gewählten Server\r\n",
	commandForbidden: "Du hast keine Erlaubnis für diesen Befehl.",
	commandNotLinked: "Kein Server mit der Gruppe verbunden.\r\nBenutze /add und /link im Bot-Chat.",
	commandErrChat1: 'Der Befehl ist nur im <a href="https://t.me/ts3bot?start">bot-chat</a> erlaubt.',
	commandErrChat2: "Der Befehl ist nur im Gruppen-Chat erlaubt. Benutze /link.",
	commandNoSelect: "Bitte wähle zuerst einen Server mit /select.",
	commandNoAdded: "Bitte füge zuerst einen Server mit /add hinzu.",
	commandNoTOS: "Bitte akzeptiere zuerst die /tos.",
	commandResult: "Befehl Suchergebnisse für '$command$':",
	commandNotFound: "Kein Befehl mit dem Inhalt '$command$' gefunden.",
	commandCommand: "\r\n<code>Befehl:        $usage$" + "\r\nBeschreibung:  $desc$" + "\r\nVerfügbarkeit: $available$</code>",
	commandsDetail: "\r\nFür Details tippe: <code>/commands [Befehl]</code>",
	commandMax: "Es werden Maximal 5 Einträge angezeigt.",

	cmd_addServer: "Hinzufügen",
	cmd_admin4all: "Admin für alle",
	cmd_cancel: "Aktion abbrechen",
	cmd_commands: "Alle Befehle",
	cmd_connect: "Verbinden",
	cmd_debug: "Debug Einstellung",
	cmd_delete: "Lösche Server und Verlinkungen",
	cmd_disconnect: "Trennen",
	cmd_faq: "Häufig gestellte Fragen",
	cmd_greetmode: "Begrüßungs-modus",
	cmd_help: "Hilfe",
	cmd_ignorebots: "Ignoriere andere Bots",
	cmd_lang: "🇺🇸 / 🇩🇪",
	cmd_link: "Gruppe verlinken",
	cmd_livetree: "TS3 Live Ansicht",
	cmd_manage: "Management",
	cmd_menu: "Menü",
	cmd_notifyjoin: "Joint Nachricht",
	cmd_reconnect: "Neu Verbinden",
	cmd_sample: "sample",
	cmd_select: "Auswählen",
	cmd_setaccount: "Query Account Details",
	cmd_setchannel: "Channel Name",
	cmd_setchanneldepth: "Channel-Output-Tiefe",
	cmd_setchatmode: "Chat Modus",
	cmd_setname: "Anzeigename",
	cmd_setserver: "Server Addresse",
	cmd_settings: "Einstellungen",
	cmd_showgroup: "Gruppen Name in TS3?",
	cmd_silent: "stumme Nachrichten?",
	cmd_spamcheck: "Spam Check",
	cmd_start: "Start",
	cmd_stats: "Statistiken",
	cmd_susers: "Kurze User Liste",
	cmd_tos: "Nutzungsbedingungen",
	cmd_unlink: "Gruppen Verlinkung trennen",
	cmd_users: "User Liste",

	cmd_whinfo: "Webhook Info",
	cmd_reload: "Lade Module & Sprachen neu",
	cmd_loaddata: "Load data",
	cmd_savedata: "Store data",
	cmd_lol: "idk",
};
