// ==UserScript==
// @name         Microsoft Docs - Auto Device Theme
// @namespace    https://thealiendrew.github.io/
// @version      1.0.0
// @description  Makes Microsoft Docs match the device theme at all times.
// @author       AlienDrew
// @license      GPL-3.0-or-later
// @match        https://docs.microsoft.com/*
// @updateURL    https://raw.githubusercontent.com/TheAlienDrew/Tampermonkey-Scripts/master/Microsoft/MS-Docs-Auto-Device-Theme.user.js
// @downloadURL  https://raw.githubusercontent.com/TheAlienDrew/Tampermonkey-Scripts/master/Microsoft/MS-Docs-Auto-Device-Theme.user.js
// @icon         https://docs.microsoft.com/favicon.ico
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

const DARK_STYLE = 'theme-dark';
const LIGHT_STYLE = 'theme-light';
const themeModeSwitchSelector = '#footer button.theme-dropdown-trigger';
const lightModeSwitchSelector = '#theme-menu button.theme-control[data-theme-to="light"]';
const darkModeSwitchSelector = '#theme-menu button.theme-control[data-theme-to="dark"]';

var watchEventTriggered = false;
var activeElement = null;

function updateTheme(changeToScheme) {
    let html = document.querySelector('html');

    let theme = 'dark';
    if (html.classList.contains(LIGHT_STYLE)) theme = 'light';

    if (theme != changeToScheme) {
        let themeModeSwitch= document.querySelector(themeModeSwitchSelector);
        themeModeSwitch.click();

        let changeThemeModeSwitch = document.querySelector(changeToScheme == 'light' ? lightModeSwitchSelector : darkModeSwitchSelector);
        changeThemeModeSwitch.click();

        if (watchEventTriggered) activeElement.focus();
    }

    watchEventTriggered = false;
}

// wait for the page to be fully loaded
window.addEventListener('load', function () {
    // now we can start
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const newColorScheme = e.matches ? 'dark' : 'light';
        watchEventTriggered = true;
        activeElement = document.activeElement;
        updateTheme(newColorScheme);
    });

    // first time run
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // dark mode
        updateTheme('dark');
    } else {
        // light mode
        updateTheme('light');
    }
}, false);
