import { REGEX } from '../constants/url';

/**
 * Focuses the first tab matching the specified URL or opens it in a new tab
 * @param {string} url the URL to focus/show
 */
export const OpenOrShowURL = async (url) => {
    const tabs = await browser.tabs.query({
        'currentWindow': true,
        'url': url
    });

    if (tabs.length) {
        return browser.tabs.update(tabs[0].id, {
            'active': true
        });
    }

    return browser.tabs.create({
        'url': url
    });
};

/**
 * Event handler for tab updates
 * @param {number} tabId the ID of the tab that was updated
 * @param {object} changeInfo properties about the tab's changes
 * @param {tab} tab the new state of the tab
 */
export const OnTabUpdate = (tabId, changeInfo, tab) => {
    if (REGEX.test(tab.url)) {
        browser.pageAction.show(tabId);
    } else {
        browser.pageAction.hide(tabId);
    }
};
