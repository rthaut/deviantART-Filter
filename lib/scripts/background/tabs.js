/* global togglePageActionPopupMenu */
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('browser.tabs.onUpdated()', tabId, changeInfo, tab);
    if (!changeInfo.url) {
        return;
    }

    if (/^https?:\/\/(\S+\.){0,}deviantart\.com/i.test(tab.url)) {
        browser.pageAction.show(tab.id);
        browser.storage.sync.get('pageActionPopupMenu').then((data) => {
            togglePageActionPopupMenu(data.pageActionPopupMenu);
        });
    } else {
        browser.pageAction.hide(tab.id);
    }
});

/**
 * Send a message to a specific tab (defaults to active tab)
 * @param {tab} [tab] - the tab to which the message should be sent (normally the active tab)
 * @param {string} message - the message to send
 */
/* exported sendMessageToTab */
function sendMessageToTab(tab, message) {
    if (tab && tab.id) {
        return browser.tabs.sendMessage(tab.id, message);
    } else {
        return browser.tabs.query({
            currentWindow: true,
            active: true
        }).then((tabs) => {
            //@TODO is it safe to assume the "active" tab is correct? what if a background script triggers this?
            return browser.tabs.sendMessage(tabs[0].id, message);
        });
    }
}

/**
 * Send a message to all tabs
 * @param {string} message - the message to send
 */
/* exported sendMessageToAllTabs */
function sendMessageToAllTabs(message) {
    return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
        tabs.forEach((tab) => {
            browser.tabs.sendMessage(tab.id, message);
        }, this);
        return true;
    });
}

