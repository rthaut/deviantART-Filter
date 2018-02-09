import BrowserPageAction from './browser-page-action';
import Filters from './filters';
import Metadata from './metadata';

import { URL } from '../../helpers/constants';

const BrowserTabs = (() => {

    const BrowserTabs = {

        /**
         *
         * @param {number} tabId
         * @param {object} changeInfo
         * @param {tab} tab
         */
        'onTabUpdated': async function (tabId, changeInfo, tab) {
            console.log('[Background] BrowserTabs.onTabUpdated()', tabId, changeInfo, tab);

            if (changeInfo.url === undefined || changeInfo.url === '') {
                return;
            }

            //TODO: most of this logic doesn't need to run when the tab isn't actually reloaded
            //      for exameple, scrolling on the Browse page updates the `offset` URL parameter,
            //      but the page itself is not reloaded (new thumbs are just injected from an AJAX request)
            //      so the filter data does NOT need to be resent, nor does the PageAction need to be changed
            //      really, just the metadata needs to be loaded on every tab update...
            //      that probably means storing a flag about each tab that indicates if it was already "processed"
            //      and updating that flag only if the URL changes more than just the `offset` URL parameter

            if (URL.REGEX.test(tab.url)) {
                //browser.pageAction.show(tab.id);
                chrome.pageAction.show(tab.id);

                Filters.sendFilterDataToTab(tab);
                Metadata.sendMetadataToTab(tab);
                const { pageActionPopupMenu } = await browser.storage.sync.get('pageActionPopupMenu');
                BrowserPageAction.togglePageActionPopupMenu(pageActionPopupMenu);
            } else {
                //browser.pageAction.hide(tab.id);
                chrome.pageAction.hide(tab.id);
            }
        },

        /**
         * Send a message to a specific tab (defaults to active tab)
         * @param {tab} [tab] - the tab to which the message should be sent (normally the active tab)
         * @param {string} message - the message to send
         */
        'sendMessageToTab': async function (tab, message) {
            console.log('[Background] BrowserTabs.sendMessageToTab()', tab, message);

            if (tab && tab.id) {
                return browser.tabs.sendMessage(tab.id, message);
            } else {
                const tabs = await browser.tabs.query({
                    'currentWindow': true,
                    'active': true
                });
                return browser.tabs.sendMessage(tabs[0].id, message);
            }
        },

        /**
         * Send a message to all tabs
         * @param {string} message - the message to send
         */
        'sendMessageToAllTabs': async function (message) {
            console.log('[Background] BrowserTabs.sendMessageToAllTabs()', message);

            const tabs = await browser.tabs.query({ 'url': URL.WILDCARD });
            console.log('[Background] BrowserTabs.sendMessageToAllTabs() :: Tabs', tabs);

            const promises = [];
            tabs.forEach((tab) => {
                promises.push(browser.tabs.sendMessage(tab.id, message));
            });

            return Promise.all(promises);
        },

        /**
         * Reloads all tabs
         */
        'reloadTabs': async function () {
            console.log('[Background] BrowserTabs.reloadTabs()');

            const tabs = await browser.tabs.query({ 'url': URL.WILDCARD });

            const promises = [];
            tabs.forEach((tab) => {
                browser.tabs.reload(tab.id);
            });

            return Promise.all(promises);
        }

    };

    return BrowserTabs;

})();

export default BrowserTabs;
