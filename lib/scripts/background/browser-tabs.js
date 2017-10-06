import BrowserPageAction from './browser-page-action';
import Filters from './filters';
import Metadata from './metadata';

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

            if (/^https?:\/\/(\S+\.){0,}deviantart\.com/i.test(tab.url)) {
                browser.pageAction.show(tab.id);
                Filters.applyFiltersToTab(tab);
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
            return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
                const promises = [];
                tabs.forEach((tab) => {
                    promises.push(browser.tabs.sendMessage(tab.id, message));
                });
                return Promise.all(promises);
            });
        }

        /**
         *
         * @param {string} css - the CSS to apply to a tab
         * @param {tab} tab - the tab to which the CSS should be applied
         */
        addCSSToTab(css, tab) {
            console.log('[Background] BrowserTabs.addCSSToTab()', css, tab);
            return browser.tabs.insertCSS(tab.id, {
                'code': css,
                'cssOrigin': 'author',
                'runAt': 'document_start'
            });
        }

        /**
         *
         * @param {string} css - the CSS to remove from a tab
         * @param {tab} tab - the tab to which the CSS should be applied
         */
        removeCSSFromTab(css, tab) {
            console.log('[Background] BrowserTabs.removeCSSFromTab()', css, tab);
            return browser.tabs.removeCSS(tab.id, {
                'code': css
            });
        }

        /**
         *
         * @param {string} css - the CSS to apply to all tabs
         */
        addCSSToAllTabs(css) {
            console.log('[Background] BrowserTabs.addCSSToAllTabs()', css);
            return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
                const promises = [];
                tabs.forEach((tab) => {
                    promises.push(this.addCSSToTab(css, tab));
                });
                return Promise.all(promises);
            }).catch((error) => {
                console.error(error);
                return Promise.reject(error);
            });
        }

        /**
         *
         * @param {string} css - the CSS to remove from all tabs
         */
        removeCSSFromAllTabs(css) {
            console.log('[Background] BrowserTabs.removeCSSFromAllTabs()', css);
            return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
                const promises = [];
                tabs.forEach((tab) => {
                    promises.push(this.removeCSSFromTab(css, tab));
                });
                return Promise.all(promises);
            }).catch((error) => {
                console.error(error);
                return Promise.reject(error);
            });
        }

        /**
         * Reloads all tabs
         */
        reloadTabs() {
            console.log('[Background] BrowserTabs.reloadTabs()');
            return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
                const promises = [];
                tabs.forEach((tab) => {
                    browser.tabs.reload(tab.id);
                });
                return Promise.all(promises);
            }).catch((error) => {
                console.error(error);
                return Promise.reject(error);
            });
        }
    }

    return new BrowserTabs();

})();

export default BrowserTabs;
