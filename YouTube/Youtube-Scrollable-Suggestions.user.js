// ==UserScript==
// @name         Youtube Scrollable Suggestions
// @namespace    https://github.com/TheAlienDrew/Tampermonkey-Scripts
// @version      3.0
// @downloadURL  https://github.com/TheAlienDrew/Tampermonkey-Scripts/raw/master/YouTube/Youtube-Scrollable-Suggestions.user.js
// @description  Converts the side video suggestions into a confined scrollable list, so you can watch your video while looking at suggestions.
// @author       AlienDrew
// @include      /^https?://www\.youtube\.com/watch\?v=*
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

// Greasemonkey doesn't allow some external scripts, including the one I've been using to detect an element existing.
// Because of this, I've include a minified version of the code in this script.
// Date code was added: March 8th, 2020 - From: https://gist.githubusercontent.com/BrockA/2625891/raw/9c97aa67ff9c5d56be34a55ad6c18a314e5eb548/waitForKeyElements.js
function waitForKeyElements(e,t,a,n){var o,r;(o=void 0===n?$(e):$(n).contents().find(e))&&o.length>0?(r=!0,o.each(function(){var e=$(this);e.data("alreadyFound")||!1||(t(e)?r=!1:e.data("alreadyFound",!0))})):r=!1;var l=waitForKeyElements.controlObj||{},i=e.replace(/[^\w]/g,"_"),c=l[i];r&&a&&c?(clearInterval(c),delete l[i]):c||(c=setInterval(function(){waitForKeyElements(e,t,a,n)},300),l[i]=c),waitForKeyElements.controlObj=l}

const pageSelector        = 'ytd-app';
const containerSelector   = '#primary';
const videoSelector       = 'video';
const suggestionsSelector = 'ytd-watch-next-secondary-results-renderer';
const autoPlaySelector    = 'ytd-compact-autoplay-renderer';
const itemsSelector       = '#items .ytd-watch-next-secondary-results-renderer:nth-child(2)';
const scrollbarWidth      = 17;
const normalTimeDelay     = 1000;
const fastTimeDelay       = 100;

var $ = window.jQuery;
var d = document;

var visibility    = d.visibilityState;
var panelWidth    = 0,
    panelHeight   = 0,
    autoVidHeight = 0;
// these change once found
var page        = null,
    container   = null,
    video       = null,
    suggestions = null,
    autoPlay    = null,
    items       = null,
    bgColor     = null,
    autoPlayBG  = null;

// don't try to do anything until page is visible
d.addEventListener('visibilitychange', function() {
    visibility = d.visibilityState;
});

// prevent page from scolling when trying to scroll on an element
// code via https://stackoverflow.com/a/33672757/7312536
function disablePageScrolling (element) {
    element.on('DOMMouseScroll mousewheel', function(ev) {
        var $this = $(this),
            scrollTop = this.scrollTop,
            scrollHeight = this.scrollHeight,
            height = $this.height(),
            delta = (ev.type == 'DOMMouseScroll' ?
                     ev.originalEvent.detail * -40 :
                     ev.originalEvent.wheelDelta),
            up = delta > 0;

        var prevent = function() {
            ev.stopPropagation();
            ev.preventDefault();
            ev.returnValue = false;
            return false;
        }
                if (!up && -delta > scrollHeight - height - scrollTop) {
            // Scrolling down, but this will take us past the bottom.
            $this.scrollTop(scrollHeight);
            return prevent();
        } else if (up && delta > scrollTop) {
            // Scrolling up, but this will take us past the top.
            $this.scrollTop(0);
            return prevent();
        }
    });
}

// change pixels to viewheight
function pxTOvh(height, pixels) {
    return (100*pixels)/height;
}

// to get separate RGB values
// code via https://stackoverflow.com/a/34980657/7312536
function getRGB(str){
  var match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
  return match ? {
    red: match[1],
    green: match[2],
    blue: match[3]
  } : {};
}

// append css styling to html page
function addStyleString(str) {
    var node = d.createElement('style');
    node.innerHTML = str;
    d.body.appendChild(node);
}

// detect position changes to change size accordingly
function fixDynamicSizes() {
    if (visibility == 'visible') {
        var scrHeight  = $(window).height(),
            vidHeight  = video.height(),
            elemPosTop = suggestions.position().top,
            elemPad    = container.css('padding-top').replace('px',''),
            minHeight  = (((scrHeight - (vidHeight / 2)) / scrHeight) * 100),
            calcHeight = (((scrHeight - elemPosTop) / scrHeight) * 100) - pxTOvh(scrHeight, elemPad),
            viewHeight = Math.max(minHeight, calcHeight),
            bgColor    = page.css('background-color'),
            autoPlayBG = 'rgba(' + getRGB(bgColor).red + ',' + getRGB(bgColor).green + ',' + getRGB(bgColor).blue + ',0.9)';

        if (panelHeight != elemPosTop) {
            panelHeight = elemPosTop;
            addStyleString(suggestionsSelector + ' { height: ' + viewHeight + 'vh;}');
        }

        var suggestionsWidth = suggestions.outerWidth(),
            autoPlayHeight = 0;
        if (autoPlay != null) autoPlayHeight = autoPlay.outerHeight(true);

        if (scrollbarWidth != 0 && panelWidth != suggestionsWidth) {
            panelWidth = suggestionsWidth;
            addStyleString(autoPlaySelector + ' { width: ' + (suggestionsWidth - scrollbarWidth) + 'px; }');
        }

        if (autoVidHeight != autoPlayHeight) {
            autoVidHeight = autoPlayHeight;
            addStyleString(itemsSelector + ' { padding-top: ' + autoPlayHeight + 'px; }');
        }

        if (autoPlay != null && autoPlay.css('background-color') != autoPlayBG) {
            addStyleString(autoPlaySelector + ' { background-color: ' + autoPlayBG + '; }');
        }

        setTimeout(fixDynamicSizes, normalTimeDelay);
    }
}

// wait until suggestions panel is given a position to start sizing
function waitForPanelPosition(time) {
    if (suggestions.position() != null) {
        fixDynamicSizes()
        return;
    } else {
        setTimeout(function() {
            waitForPanelPosition(time);
        }, time);
    }
}

// enabled scrollbar on suggestions panel, and start sizing
waitForKeyElements(itemsSelector, function () {
    page = $(pageSelector);
    container = $(containerSelector);
    video = $(videoSelector);
    suggestions = $(suggestionsSelector);
    autoPlay = $(autoPlaySelector);
    items = $(itemsSelector);

    bgColor = page.css('background-color');
    autoPlayBG = 'rgba(' + getRGB(bgColor).red + ',' + getRGB(bgColor).green + ',' + getRGB(bgColor).blue + ',0.9)';

    disablePageScrolling(suggestions);
    disablePageScrolling(autoPlay);

    addStyleString(suggestionsSelector + ' { overflow-y: scroll !important; }');
    addStyleString(autoPlaySelector + ' { position: absolute; z-index: 100; }');

    waitForPanelPosition(fastTimeDelay);
});