import BrowserPageAction from './browser-page-action';
import Filters from './filters';
import Metadata from './metadata';

import { URL } from '../../helpers/constants.js';

const BrowserTabs = (() => {

    class BrowserTabs {

        /**
         *
         * @param {number} tabId
         * @param {object} changeInfo
         * @param {tab} tab
         */
        onTabUpdated(tabId, changeInfo, tab) {
            console.log('[Background] BrowserTabs.onTabUpdated()', tabId, changeInfo, tab);
            if (!changeInfo.url) {
                return;
            }

            if (URL.REGEX.test(tab.url)) {
                browser.pageAction.show(tab.id);
                Filters.sendFilterDataToTab(tab);
                Metadata.insertMetadata(tab);
                browser.storage.sync.get('pageActionPopupMenu').then((data) => {
                    BrowserPageAction.togglePageActionPopupMenu(data.pageActionPopupMenu);
                });
            } else {
                browser.pageAction.hide(tab.id);
            }
        }

        /**
         * Send a message to a specific tab (defaults to active tab)
         * @param {tab} [tab] - the tab to which the message should be sent (normally the active tab)
         * @param {string} message - the message to send
         */
        sendMessageToTab(tab, message) {
            console.log('[Background] BrowserTabs.sendMessageToTab()', tab, message);
            if (tab && tab.id) {
                return browser.tabs.sendMessage(tab.id, message);
            } else {
                return browser.tabs.query({
                    'currentWindow': true,
                    'active': true
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
        sendMessageToAllTabs(message) {
            console.log('[Background] BrowserTabs.sendMessageToAllTabs()', message);
            return browser.tabs.query({ 'url': URL.WILDCARD }).then((tabs) => {
                const promises = [];
                tabs.forEach((tab) => {
                    promises.push(browser.tabs.sendMessage(tab.id, message));
                });
                return Promise.all(promises);
            });
        }

        /**
         * Reloads all tabs
         */
        reloadTabs() {
            console.log('[Background] BrowserTabs.reloadTabs()');
            return browser.tabs.query({ 'url': URL.WILDCARD }).then((tabs) => {
                const promises = [];
                tabs.forEach((tab) => {
                    browser.tabs.reload(tab.id);
                });
                return Promise.all(promises);
            }).catch((error) => {
                console.error('[Background] BrowserTabs.reloadTabs() :: Error', error);
                return Promise.reject(error);
            });
        }
    }

    return new BrowserTabs();

})();

export default BrowserTabs;
