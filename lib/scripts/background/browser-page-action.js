import Management from './management';

import { URL } from '../../helpers/constants';

const BrowserPageAction = (() => {

    const BrowserPageAction = {

        /**
         *
         * @param {tab} tab
         */
        'onPageActionClicked': function (tab) {
            console.log('[Background] BrowserPageAction.onClicked()', tab);

            return Management.showManagementPanel();
        },

        /**
         *
         */
        'initPageAction': async function () {
            console.log('[Background] BrowserPageAction.initPageAction()');

            const tabs = await browser.tabs.query({
                'url': URL.WILDCARD
            });

            tabs.forEach((tab) => {
                try {
                    browser.pageAction.show(tab.id);
                } catch (error) {
                    chrome.pageAction.show(tab.id);
                }
            });

            return true;
        },

        /**
         *
         * @param {string} type
         */
        'setPageActionIcon': async function (path) {
            console.log('[Background] BrowserPageAction.setPageActionIcon()', path);

            const tabs = await browser.tabs.query({
                'url': URL.WILDCARD
            });

            tabs.forEach((tab) => {
                this.setPageActionIconForTab(tab.id, path);
            });

            return true;
        },

        /**
         *
         * @param {number} tabId
         * @param {string} type
         */
        'setPageActionIconForTab': function (tabId, path) {
            console.log('[Background] BrowserPageAction.setPageActionIconForTab()', tabId, path);

            return browser.pageAction.setIcon({
                'tabId': tabId,
                'path': path
            });
        }

    };

    return BrowserPageAction;

})();

export default BrowserPageAction;
