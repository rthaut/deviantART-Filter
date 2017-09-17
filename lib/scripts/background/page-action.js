/* global showManagementPanel */
browser.pageAction.onClicked.addListener((tab) => {
    console.log('browser.pageAction.onClicked()', tab);
    return showManagementPanel(tab);
});

/**
 *
 */
/* exported initPageAction */
function initPageAction() {
    console.log('initPageAction()');
    return Promise.all([
        browser.storage.sync.get('pageActionPopupMenu').then((data) => {
            return togglePageActionPopupMenu(data.pageActionPopupMenu);
        }),
        browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
            tabs.forEach((tab) => {
                browser.pageAction.show(tab.id);
            }, this);
            return true;
        })
    ]);
}

/**
 *
 * @param {string} type
 */
/* global setPageActionIconForTab */
/* exported setPageActionIcon */
function setPageActionIcon(type) {
    console.log('setPageActionIcon()', type);
    return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
        tabs.forEach((tab) => {
            setPageActionIconForTab(tab.id, type);
        }, this);
        return true;
    });
}

/**
 *
 * @param {integer} tabId
 * @param {string} type
 */
/* exported setPageActionIconForTab */
function setPageActionIconForTab(tabId, type) {
    console.log('setPageActionIconForTab()', tabId, type);
    return browser.pageAction.setIcon({
        tabId: tabId,
        path: browser.extension.getURL('icons/icon-action-' + type + '.svg')
    });
}

/**
 *
 * @param {boolean} enabled
 */
/* exported togglePageActionPopupMenu */
function togglePageActionPopupMenu(enabled) {
    console.log('togglePageActionPopupMenu()', enabled);
    return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
        tabs.forEach((tab) => {
            browser.pageAction.setPopup({
                tabId: tab.id,
                popup: enabled ? browser.extension.getURL('pages/popup/popup.html') : ''
            });
        }, this);
        return true;
    });
}
