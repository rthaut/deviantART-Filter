import { AddFilter, RemoveFilter, UpdateFilter } from './filters';
import { ADD_FILTER, REMOVE_FILTER, UPDATE_FILTER, SAVE_FILTERS } from '../constants/messages';

export const OnRuntimeMessage = (message) => {
    switch (message.action) {
        case ADD_FILTER:
            return AddFilter(message.data.key, message.data.value);
        case REMOVE_FILTER:
            return RemoveFilter(message.data.key, message.data.value);
        case UPDATE_FILTER:
            return UpdateFilter(message.data.key, message.data.value.old, message.data.value.new);
        case SAVE_FILTERS:
            console.time('SAVE_FILTER');
            // eslint-disable-next-line no-case-declarations
            const data = {};
            data[message.data.key] = message.data.value;
            return browser.storage.local.set(data).then(() => {
                console.timeEnd('SAVE_FILTER');
            });
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
