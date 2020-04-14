import { GetCategories } from './categories';
import * as FILTERS from './filters';
import * as MESSAGES from '../constants/messages';

export const OnRuntimeMessage = (message) => {
    switch (message.action) {
        case MESSAGES.ADD_FILTER:
            return FILTERS.AddFilter(message.data.key, message.data.value);
        case MESSAGES.REMOVE_FILTER:
            return FILTERS.RemoveFilter(message.data.key, message.data.value);
        case MESSAGES.UPDATE_FILTER:
            return FILTERS.UpdateFilter(message.data.key, message.data.value.old, message.data.value.new);
        case MESSAGES.SAVE_FILTER:
            return FILTERS.SaveFilter(message.data.key, message.data.value);
        case MESSAGES.RESET_FILTERS:
            return browser.storage.local.set({
                'users': [],
                'keywords': [],
                'categories': []
            });
        case MESSAGES.IMPORT_FILTERS:
            return FILTERS.ImportFilters(message.data);
        case MESSAGES.EXPORT_FILTERS:
            return FILTERS.GetAllFilters();
        case MESSAGES.FETCH_METADATA:
            return fetch(new URL(`https://backend.deviantart.com/oembed?url=${message.data.url}`))
                .then(response => response.json());
        case MESSAGES.FETCH_CATEGORIES:
            return GetCategories();
    }
};

export const SendMessageToAllTabs = async (action, data) => {
    const tabs = await browser.tabs.query({ 'url': '*://*.deviantart.com/*' });
    for (const tab of tabs) {
        console.debug(tab);
        browser.tabs.sendMessage(tab.id, { action, data });
    }
};

export const SendMessageToScriptPage = async (page, action, data) => {
    const tabs = await browser.tabs.query({ 'url': browser.runtime.getURL(page) });
    for (const tab of tabs) {
        console.debug(tab);
        browser.tabs.sendMessage(tab.id, { action, data });
    }
};
