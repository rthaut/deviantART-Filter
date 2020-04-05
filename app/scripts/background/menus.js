import { AddFilter } from './filters';

export const MENUS = [
    {
        'id': 'filter-tag',
        'title': 'Create Keyword Filter for this Tag',
        'contexts': ['link'],
        'targetUrlPatterns': ['*://*.deviantart.com/tag/*']
    }
];

/**
 * Event handler for when a menu item is clicked
 * @param {object} info menu info
 * @param {object} tab tab info
 */
export const OnMenuClicked = (info, tab) => {
    switch (info.menuItemId) {
        case 'filter-tag':
            if (/\/tag\/([^\/]+)/i.matches(info.linkUrl)) {
                // eslint-disable-next-line no-case-declarations
                const keyword = /\/tag\/([^\/]+)/i.exec(info.linkUrl)[1];
                AddFilter('keywords', { keyword, 'wildcard': false });
            }
            break;

        default:
            break;
    }
};

/**
 * Event handler for when a menu is shown (Firefox only)
 * @param {object} info menu info
 * @param {object} tab tab info
 */
export const OnMenuShown = (info, tab) => {
    // TODO: this logic works while we only have one custom menu, but will need reworked for multiple menus
    // NOTE: `menuItemId` is not available on the `info` object; maybe test `linkUrl` against applicable patterns?

    if (/\/tag\/([^\/]+)/i.matches(info.linkUrl)) {
        const keyword = /\/tag\/([^\/]+)/i.exec(info.linkUrl)[1];
        UpdateMenuItem('filter-tag', {
            'title': `Create Keyword Filter for "${keyword}" Tag`
        });
    }
};

/**
 * Updates and refreshes an existing menu item
 * @param {string} id the ID of the item to update
 * @param {object} properties the properties to update
 */
const UpdateMenuItem = (id, properties) => {
    browser.contextMenus.update(id, properties);
    browser.contextMenus.refresh();
};