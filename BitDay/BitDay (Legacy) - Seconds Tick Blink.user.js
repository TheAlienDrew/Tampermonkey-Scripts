// ==UserScript==
// @name         BitDay (Legacy) - Seconds Tick Blink
// @namespace    https://thealiendrew.github.io/
// @version      1.0.1
// @description  Makes the colon blink to each second.
// @author       AlienDrew
// @license      GPL-3.0-or-later
// @include      /^https?://www\.bitday\.me/legacy*/
// @updateURL    https://raw.githubusercontent.com/TheAlienDrew/Tampermonkey-Scripts/master/BitDay/BitDay%20(Legacy)%20-%20Seconds%20Tick%20Blink.user.js
// @downloadURL  https://raw.githubusercontent.com/TheAlienDrew/Tampermonkey-Scripts/master/BitDay/BitDay%20(Legacy)%20-%20Seconds%20Tick%20Blink.user.js
// @grant        none
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

var clockText = document.querySelector("#container > div.clock > h3");

// need mutation observer to sync with time updates
let observer = new MutationObserver(mutations => {
  // watch the clock for changes (not always visible)
  for(let mutation of mutations) {
    // only change the text if we haven't already
    let addedNodes = mutation.addedNodes;
    if (addedNodes && addedNodes.length == 1 && addedNodes[0].textContent.indexOf(':') > -1) {
      setTimeout(function() {
        clockText.innerText = clockText.innerText.replace(':', ' ');
      }, 500);
    }
  }
});

// configuration of the observer:
let config = { childList: true, characterData: true, subtree: true };

// pass in the target node, as well as the observer options
observer.observe(clockText, config);