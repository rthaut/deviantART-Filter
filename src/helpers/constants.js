export const URL = {
    'WILDCARD': '*://*.deviantart.com/*',
    'REGEX': /^https ?:\/\/(?:(\S+)\.)?deviantart\.com\/([^\?]*)(?:\?(.*))?/i
};

export const DEVIATION_SLUG_REGEX = /\/([^\/]+)\/?$/;

export const PLACEHOLDER_CSS = [
    'z-index: 101;',
    'position: absolute;',
    'top: 0;',
    'right: 0;',
    'bottom: 0;',
    'left: 0;',
    'width: 100%;',
    'height: 100%;',
    'content: "";',
    'background-color: #DDE6DA;',
    `background-image: url(${browser.runtime.getURL('images/logo/logo-muted.svg')});`,
    'background-position: center center;',
    'background-repeat: no-repeat;',
    'background-size: 80% 50%;'
].join('\n');

export const PLACEHOLDER_TEXT_CSS = [
    'z-index: 102;',
    'position: absolute;',
    'top: 80%;',
    'right: 0;',
    'bottom: 0;',
    'left: 0;',
    'width: 100%;',
    'height: 20%;',
    'text-align: center;',
    'color: #B4C0B0;',
    'font-weight: bold;',
    'line-height: 1.25em;',
    'background: none;'
].join('\n');
