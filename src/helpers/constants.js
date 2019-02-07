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
    'box-sizing: border-box;',
    'background-color: var(--placeholder-bg-color);',
    'color: var(--placeholder-text-color);',
    'font-weight: bold;',
    'line-height: 1.25em;',
    'padding: 1.5em;',
    'text-align: center;',
    'display: flex;',
    'flex-direction: column-reverse;'
].join('\n');

export const PLACEHOLDER_LOGO_CSS = [
    'z-index: 101;',
    'position: absolute;',
    'top: 0;',
    'right: 0;',
    'bottom: 0;',
    'left: 0;',
    'width: 100%;',
    'height: 100%;',
    'content: "";',
    'background-color: var(--placeholder-logo-color);',
    `mask-image: url(${browser.runtime.getURL('images/placeholder.svg')});`,
    'mask-position: center center;',
    'mask-repeat: no-repeat;',
    'mask-size: 80% 50%;',
    `-webkit-mask-image: url(${browser.runtime.getURL('images/placeholder.svg')});`,
    '-webkit-mask-position: center center;',
    '-webkit-mask-repeat: no-repeat;',
    '-webkit-mask-size: 80% 50%;',
].join('\n');
