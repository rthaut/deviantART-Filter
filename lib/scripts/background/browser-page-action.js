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

            return Management.showManagementPanel(tab);
        },

        /**
         *
         */
        'initPageAction': async function () {
            console.log('[Background] BrowserPageAction.initPageAction()');

            const { pageActionPopupMenu } = await browser.storage.sync.get('pageActionPopupMenu');
            await this.togglePageActionPopupMenu(pageActionPopupMenu);

            const tabs = await browser.tabs.query({
                'url': URL.WILDCARD
            });

            tabs.forEach((tab) => {
                //browser.pageAction.show(tab.id);
                chrome.pageAction.show(tab.id);
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
         * @param {integer} tabId
         * @param {string} type
         */
        'setPageActionIconForTab': function (tabId, path) {
            console.log('[Background] BrowserPageAction.setPageActionIconForTab()', tabId, path);

            return browser.pageAction.setIcon({
                'tabId': tabId,
                'path': path
            });
        },

        /**
         *
         * @param {boolean} enabled
         */
        'togglePageActionPopupMenu': async function (enabled) {
            console.log('[Background] BrowserPageAction.togglePageActionPopupMenu()', enabled);

            const tabs = await browser.tabs.query({
                'url': URL.WILDCARD
            });

            tabs.forEach((tab) => {
                browser.pageAction.setPopup({
                    'tabId': tab.id,
                    'popup': enabled ? 'pages/popup/popup.html' : ''
                });
            });

            return true;
        }

    };

    return BrowserPageAction;

})();

export default BrowserPageAction;
