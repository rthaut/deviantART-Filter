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
        'initPageAction': function () {
            console.log('[Background] BrowserPageAction.initPageAction()');
            return Promise.all([
                browser.storage.sync.get('pageActionPopupMenu').then((data) => {
                    return this.togglePageActionPopupMenu(data.pageActionPopupMenu);
                }),
                browser.tabs.query({
                    'url': URL.WILDCARD
                }).then((tabs) => {
                    tabs.forEach((tab) => {
                        try {
                            browser.pageAction.show(tab.id);
                        } catch (ex) {
                            //TODO: remove this try/catch block if/when the browser polyfill is fixed
                            chrome.pageAction.show(tab.id);
                        }
                    });
                    return true;
                })
            ]);
        },

        /**
         *
         * @param {string} type
         */
        'setPageActionIcon': function (type) {
            console.log('[Background] BrowserPageAction.setPageActionIcon()', type);
            return browser.tabs.query({
                'url': URL.WILDCARD
            }).then((tabs) => {
                tabs.forEach((tab) => {
                    this.setPageActionIconForTab(tab.id, type);
                });
                return true;
            });
        },

        /**
         *
         * @param {integer} tabId
         * @param {string} type
         */
        'setPageActionIconForTab': function (tabId, type) {
            console.log('[Background] BrowserPageAction.setPageActionIconForTab()', tabId, type);
            return browser.pageAction.setIcon({
                'tabId': tabId,
                'path': 'icons/icon-action-' + type + '.svg'
            });
        },

        /**
         *
         * @param {boolean} enabled
         */
        'togglePageActionPopupMenu': function (enabled) {
            console.log('[Background] BrowserPageAction.togglePageActionPopupMenu()', enabled);
            return browser.tabs.query({
                'url': URL.WILDCARD
            }).then((tabs) => {
                tabs.forEach((tab) => {
                    browser.pageAction.setPopup({
                        'tabId': tab.id,
                        'popup': enabled ? 'pages/popup/popup.html' : ''
                    });
                });
                return true;
            });
        }

    };

    return BrowserPageAction;

})();

export default BrowserPageAction;
