/* global togglePageActionPopupMenu */
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('browser.tabs.onUpdated()', tabId, changeInfo, tab);
    if (!changeInfo.url) {
        return;
    }

    if (/^https?:\/\/(\S+\.){0,}deviantart\.com/i.test(tab.url)) {
        browser.pageAction.show(tab.id);
        browser.storage.sync.get('pageActionPopupMenu').then((res) => {
            togglePageActionPopupMenu(res.pageActionPopupMenu);
        });
    } else {
        browser.pageAction.hide(tab.id);
    }
});

/* global showManagementPanel */
browser.pageAction.onClicked.addListener((tab) => {
    console.log('browser.pageAction.onClicked()', tab);
    return showManagementPanel(tab);
});

/* global initDefaultOptions initPageAction */
browser.runtime.onInstalled.addListener((details) => {
    console.log('browser.runtime.onInstalled()', details);
    switch (details.reason) {
        case 'install':
            console.log('The extension was installed' + (details.temporary ? ' temporarilly' : '') + '.');
            initDefaultOptions();
            initPageAction();
            break;

        case 'update':
            console.log('The extension was updated to a new version:', details.previousVersion);
            initDefaultOptions();
            initPageAction();
            break;

        case 'browser_update':
        case 'chrome_update':
            console.log('The browser was updated to a new version.');
            break;

        case 'shared_module_update':
            console.log('Another extension (ID: ' + details.id + '), which contains a module used by this extension, was updated.');
            break;
    }
});
