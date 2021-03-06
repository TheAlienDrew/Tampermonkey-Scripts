// ==UserScript==
// @name         Ping Bot
// @namespace    https://thealiendrew.github.io/
// @version      0.2.5
// @description  Sounds off a notification when the user of bot gets a ping!
// @author       AlienDrew
// @license      GPL-3.0-or-later
// @include      /^https?://www\.multiplayerpiano\.com*/
// @include      /^https?://multiplayerpiano\.(com|net)*/
// @include      /^https?://mppclone\.com*/
// @updateURL    https://raw.githubusercontent.com/TheAlienDrew/Tampermonkey-Scripts/master/Multiplayer%20Piano/MPP-Ping-Bot/MPP-Ping-Bot.user.js
// @downloadURL  https://raw.githubusercontent.com/TheAlienDrew/Tampermonkey-Scripts/master/Multiplayer%20Piano/MPP-Ping-Bot/MPP-Ping-Bot.user.js
// @icon         https://cdn.iconscout.com/icon/free/png-256/notification-1765818-1505607.png
// @grant        GM_info
// @run-at       document-end
// ==/UserScript==

/* Copyright (C) 2020  Andrew Larson (thealiendrew@gmail.com)

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/* globals MPP */

// =============================================== CONSTANTS

// Script constants
const SCRIPT = GM_info.script;
const NAME = SCRIPT.name;
const NAMESPACE = SCRIPT.namespace;
const VERSION = SCRIPT.version;
const DESCRIPTION = SCRIPT.description;
const AUTHOR = SCRIPT.author;
const DOWNLOAD_URL = SCRIPT.downloadURL;

// Time constants (in milliseconds)
const TENTH_OF_SECOND = 100; // mainly for repeating loops

// URLs
const FEEDBACK_URL = "https://forms.gle/EMTXKvvR9xKjyHMZ7";

// Bot constants
const CHAT_MAX_CHARS = 512; // there is a limit of this amount of characters for each message sent (DON'T CHANGE)

// Audio
const AUDIO_BASE_URL = "https://raw.githubusercontent.com/TheAlienDrew/Tampermonkey-Scripts/master/Multiplayer%20Piano/MPP-Ping-Bot/freesound.org/";
const AUDIO_EXENSION = "mp3";

// Bot custom constants
const PING_PREFIX = '@';
const PING_START = '<';
const PING_END = '>';
const PRE_MSG = NAME + " (v" + VERSION + "): ";
const PRE_HELP = PRE_MSG + "[Help]";
const PRE_LINK = PRE_MSG + "[Link]";
const PRE_FEEDBACK = PRE_MSG + "[Feedback]";
const HELP_DESC = "Ping usage is as follows: Get everyone's attention with @<all>, @<online>, or @<everyone>, or to ping a specific user, use @<A Username Here> or @<a user id here>. Use @<link> to get bot download URL, or use @<feedback> to submit feedback.";

// =============================================== OBJECT INITIALIZERS

// Create new audio objects prefixed with URL and postfixed with extension
var newAudio = function(name) {
    return new Audio(AUDIO_BASE_URL + name + '.' + AUDIO_EXENSION);
}

// =============================================== AUDIO

var pingSound = newAudio("level-up-01");

// =============================================== FUNCTIONS

// Check to make sure variable is initialized with something
var exists = function(element) {
    if (typeof(element) != "undefined" && element != null) return true;
    return false;
}

// =============================================== MAIN

MPP.client.on('a', function (msg) {
    // if user switches to VPN, these need to update
    var yourParticipant = MPP.client.getOwnParticipant();
    var yourId = yourParticipant._id;
    var yourUsername = yourParticipant.name;
    // get the message as string
    var input = msg.a.trim();
    var participant = msg.p;
    var userId = participant._id;
    var username = participant.name;
    var pinged = false;
    // check if input contains the prefix + argument
    var helpActivated = false;
    var possibleArgs = [yourId, yourUsername, "help", "link", "feedback", "self", "all", "online", "everyone"];
    var i;
    for(i = 0; i < possibleArgs.length; i++) {
        var possiblePing = possibleArgs[i];
        var possiblePingLength = possiblePing.length;
        var pingFormatted = PING_PREFIX + PING_START + possiblePing + PING_END;
        var pingStartingLength = PING_PREFIX.length + PING_START.length;
        var pingFormattedLength = pingFormatted.length;

        // check by case sensitivity
        var match = null;
        var caseSensitive = (possiblePing == yourId || possiblePing == yourUsername);
        if (caseSensitive) {
            var caseSensitiveCheck = input.indexOf(pingFormatted);
            var caseSensitiveStart = caseSensitiveCheck + pingStartingLength;
            if (caseSensitiveCheck >= 0) match = input.substring(caseSensitiveStart, caseSensitiveStart + possiblePingLength);
        } else {
            var inputLC = input.toLowerCase();
            var caseInsensitiveCheck = inputLC.indexOf(pingFormatted);
            var caseInsensitiveStart = caseInsensitiveCheck + pingStartingLength;
            if (caseInsensitiveCheck >= 0) match = inputLC.substring(caseInsensitiveStart, caseInsensitiveStart + possiblePingLength);
        }

        // only execute command if we found a match
        if (match != null) {
            // execute some commands for only the bot user
            if (userId == yourId) {
                switch(match) {
                    case "help": MPP.chat.send(PRE_HELP + ' ' + HELP_DESC); break;
                    case "link": if (input.indexOf(PRE_HELP) != 0) MPP.chat.send(PRE_LINK + " You can download this bot from " + DOWNLOAD_URL); break;
                    case "feedback": if (input.indexOf(PRE_HELP) != 0) MPP.chat.send(PRE_FEEDBACK + " Please go to " + FEEDBACK_URL + " in order to submit feedback."); break;
                    case "self": if (input.indexOf(PRE_HELP) != 0) pinged = true; break;
                }
            }
            // any user can use these
            switch(match) {
                case yourId: case yourUsername:
                case "all": case "online": case "everyone": if (input.indexOf(PRE_HELP) != 0) pinged = true; break;
            }
        }
    }
    if (pinged) pingSound.play();
});
// =============================================== INTERVALS

// Automatically turns off the sound warning (mainly for autoplay)
var clearSoundWarning = setInterval(function() {
    var playButton = document.querySelector("#sound-warning button");
    if (exists(playButton)) {
        clearInterval(clearSoundWarning);
        playButton.click();
        // wait for the client to come online
        var waitForMPP = setInterval(function() {
            if (exists(MPP) && exists(MPP.client) && exists(MPP.client.channel) && exists(MPP.client.channel._id) && MPP.client.channel._id != "") {
                clearInterval(waitForMPP);

                console.log(PRE_MSG + ": Online!");
            }
        }, TENTH_OF_SECOND);
    }
}, TENTH_OF_SECOND);
