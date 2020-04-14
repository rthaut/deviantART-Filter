const semver = require('semver');

import { GetCategories } from './background/categories';
import { ImportFilters } from './background/filters';
import { MENUS, OnMenuClicked, OnMenuShown } from './background/menus';
import { OnRuntimeMessage } from './background/messages';
import { OnLocalStorageChanged } from './background/storage';

browser.runtime.onInstalled.addListener(async (details) => {
    const { previousVersion } = details;

    if (semver.valid(previousVersion) && semver.lt(previousVersion, '6.0.0')) {
        const data = await browser.storage.local.get('tags');
        if (data?.tags) {
            console.warn('Converting tag filters to keyword filters');
            await ImportFilters(data);
            // TODO: is it appropriate to delete tag filters from previous versions?
            // await browser.storage.local.remove('tags');
        }
    }

    // fetch and store the latest category paths
    await GetCategories();
});

/* Page Action */
browser.pageAction.onClicked.addListener((tab) => {
    browser.tabs.create({
        'url': browser.runtime.getURL('pages/manage.html')
    });
});
browser.tabs.onUpdated.addListener((tabId) => {
    browser.pageAction.show(tabId);
});


/* Runtime Messages */
browser.runtime.onMessage.addListener(OnRuntimeMessage);


/* Storage */
browser.storage.onChanged.addListener((changes, areaName) => {
    switch (areaName) {
        case 'local':
            OnLocalStorageChanged(changes);
            break;
    }
});


/* Context Menus */
try {
    MENUS.forEach(menu => browser.contextMenus.remove(menu.id).finally(browser.contextMenus.create(menu)));
    browser.contextMenus.onClicked.addListener(OnMenuClicked);
} catch (ex) {
    console.error('Failed to setup context menus', ex);
}

try {
    browser.contextMenus.onShown.addListener(OnMenuShown);
} catch (ex) {
    // chrome doesn't support the onShown event, but we don't use it for major functionality, so just ignore it
    void(ex);
}
