import Management from './management';

const BrowserPageAction = (() => {

    class BrowserPageAction {

        /**
         *
         * @param {tab} tab
         */
        onPageActionClicked(tab) {
            console.log('[Background] BrowserPageAction.onClicked()', tab);
            return Management.showManagementPanel(tab);
        }

        /**
         *
         */
        initPageAction() {
            console.log('[Background] BrowserPageAction.initPageAction()');
            return Promise.all([
                browser.storage.sync.get('pageActionPopupMenu').then((data) => {
                    return this.togglePageActionPopupMenu(data.pageActionPopupMenu);
                }),
                browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
                    tabs.forEach((tab) => {
                        browser.pageAction.show(tab.id);
                    }, this);
                    return true;
                })
            ]);
        }

        /**
         *
         * @param {string} type
         */
        setPageActionIcon(type) {
            console.log('[Background] BrowserPageAction.setPageActionIcon()', type);
            return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
                tabs.forEach((tab) => {
                    this.setPageActionIconForTab(tab.id, type);
                }, this);
                return true;
            });
        }

        /**
         *
         * @param {integer} tabId
         * @param {string} type
         */
        setPageActionIconForTab(tabId, type) {
            console.log('[Background] BrowserPageAction.setPageActionIconForTab()', tabId, type);
            return browser.pageAction.setIcon({
                'tabId': tabId,
                'path': browser.extension.getURL('icons/icon-action-' + type + '.svg')
            });
        }

        /**
         *
         * @param {boolean} enabled
         */
        togglePageActionPopupMenu(enabled) {
            console.log('[Background] BrowserPageAction.togglePageActionPopupMenu()', enabled);
            return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
                tabs.forEach((tab) => {
                    browser.pageAction.setPopup({
                        'tabId': tab.id,
                        'popup': enabled ? browser.extension.getURL('pages/popup/popup.html') : ''
                    });
                }, this);
                return true;
            });
        }

    }

    return new BrowserPageAction();

})();

export default BrowserPageAction;
