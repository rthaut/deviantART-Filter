import { MENUS, OnMenuClicked, OnMenuShown } from './background/menus';
import { OnRuntimeMessage } from './background/messages';
import { OnLocalStorageChanged } from './background/storage';

browser.runtime.onInstalled.addListener(async (details) => {
    console.debug('previousVersion', details.previousVersion);

    // console.debug('Resetting stored filters');
    // await browser.storage.local.set({
    //     'users': [],
    //     'keywords': [],
    //     'categories': []
    // });

    // console.debug('Importing test filters into storage');
    // const list = require('../../tests/shanimiyano\'s_deviantart_fetish_filter_list.json');
    // const list = require('../../tests/frontpage_test_filters.json');
    // await browser.storage.local.set(list);
    // const users = require('../../tests/random_usernames.json');
    // await browser.storage.local.set({ users });
    // const keywords = require('../../tests/random_keywords.json');
    // await browser.storage.local.set({ keywords });
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
MENUS.forEach(menu => browser.contextMenus.create(menu));
browser.contextMenus.onClicked.addListener(OnMenuClicked);
browser.contextMenus.onShown.addListener(OnMenuShown);
