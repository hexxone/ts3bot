import { TeamSpeakChannel, TeamSpeakClient } from "ts3-nodejs-library";

export default class {
	/*
	 *  STRING UTILITIES
	 */

	// returns the longest's row length of a text
	static longestRow(str): number {
		if (!str.match("\r\n")) return str.length;
		return str.split("\r\n").sort((a, b) => b.length - a.length)[0].length;
	}

	// returns the adequate channel flag
	static getChannelFlag(channel: TeamSpeakChannel, myCid?: string): string {
		if (channel.cid == myCid) return "📍";
		if (channel.flagDefault) return "🏠";
		if (channel.flagPassword) return "🔒";
		return "💬";
	}

	// returns the adequate user audio flag
	static getUserAudioFlag(user: TeamSpeakClient): string {
		if (user.type == 1) return "🤖";
		if (user.away == 1) return this.getClockEmoji(user.idleTime);
		if (user.outputMuted) return "🔇";
		if (user.inputMuted) return "🤐";
		if (user.isRecording) return "🔴";
		if (user.isChannelCommander) return "⭐️";
		if (user.isPrioritySpeaker) return "Ⓜ️";
		return "🔵";
	}

	// returns the clock emoji closest to the given (idle) time
	static getClockEmoji(timeSpan): string {
		const a = new Date(timeSpan);
		let d = ~~((a.getHours() % 12) * 2 + a.getMinutes() / 30 + 0.5);
		d += d < 2 ? 24 : 0;
		return String.fromCharCode(55357, 56655 + (d % 2 ? 23 + d : d) / 2);
	}

	// Function that excludes the [spacer] strings from channel names
	static fixSpacer(str): string {
		return String(str)
			.replace(/(\[\*{0,1}[lrc]{0,1}spacer[0-9]{0,}\])/g, "")
			.trim();
	}

	// Function that actually fixes the [spacer] strings from channel names
	static fixSpacers(str): string {
		// get longest row's length
		const longest = this.longestRow(str);

		// left spacers will be displayed like normal channels but without Icon in front
		// the icon will be captured in the following regex and removed.
		let noLSpacer = String(str).replace(/(.*\[\*{0,1}lspacer[0-9]{0,}\])/g, "");

		// fix right and center spacers
		const spacers = [...noLSpacer.matchAll(/(.*\[\*{0,1}[c,r]{1}spacer[0-9]{0,}\])(.*)/g)];
		for (const spacer of spacers) {
			// 0=wohle match, 1=1st capture group 2=2nd capture group etc.
			const txt = spacer[2].trim();
			// get amount of spaces for correct positioning
			let spaceCnt = longest - txt.length;
			// if centered spacer, divide by 2
			if (spacer[1].match("cspacer")) spaceCnt /= 2;
			// rebuild and replace the old row
			// ~~ = math.floor after divide
			const realRow = this.getSpaces(~~spaceCnt) + txt;
			noLSpacer = noLSpacer.replace(spacer[0], realRow);
		}

		// fix repeating spacers
		// => *spacer is same as spacer
		const repeating = [...noLSpacer.matchAll(/(.*\[\*{0,1}spacer[0-9]{0,}\])(.*)/g)];
		for (const repeat of repeating) {
			// 0=wohle match, 1=1st capture group 2=2nd capture group etc.
			const txt = repeat[2].trim();
			// rebuild and replace the old row
			let realRow = txt;
			while (realRow.length < longest) realRow += txt;
			if (realRow.length > longest) realRow = realRow.substring(0, longest - 1);
			noLSpacer = noLSpacer.replace(repeat[0], realRow);
		}
		// done
		return noLSpacer;
	}

	// function to return given amount of spaces
	static getSpaces(count): string {
		let sp = "";
		for (let i = 0; i < count; i++) sp += " ";
		return sp;
	}

	// fix ip address leak for ts3 bot names
	static fixNameToTelegram(str): string {
		const ip = str.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}):?([0-9]{1,5})?/);
		if (ip) {
			if (ip instanceof Array) {
				for (let i = 0; i < ip.length; i++) str = str.replace(ip[i], "[IP]");
			} else {
				str = str.replace(ip, "[IP]");
			}
		}
		return str;
	}

	// removes [URL]-Tags from links
	static fixUrlToTelegram(str): string {
		return str.replace(/\[\/*URL\]/g, "").replace(/[<|>]/g, "");
	}
}
