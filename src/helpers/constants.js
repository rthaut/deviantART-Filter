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
    'color: var(--placeholder-logo-color);',
    'background-color: var(--placeholder-bg-color);',
    `background-image: url("${browser.runtime.getURL('images/placeholder-dark.svg')}");`,
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
    'color: var(--placeholder-text-color);',
    'font-weight: bold;',
    'line-height: 1.25em;',
    'background: none;'
].join('\n');
