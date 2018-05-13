import BrowserTabs from './browser-tabs';

const Management = (() => {

    const WINDOW_TYPE = 'popup';
    const MANAGEMENT_URL = browser.runtime.getURL('pages/manage/manage.html');

    const Management = {

        /**
         * Shows the management panel using the user's configured type (as a tab or a popup window)
         */
        'showManagementPanel': async function () {
            console.log('[Background] Management.showManagementPanel()');

            const { managementPanelType } = await browser.storage.sync.get('managementPanelType');

            switch (managementPanelType) {
                case 'window':
                    console.log('Showing management panel in a window');
                    await this.showManagementPanelWindow();
                    return browser.history.deleteUrl({
                        'url': MANAGEMENT_URL
                    });

                case 'tab':
                default:
                    console.log('Showing management panel in a tab');
                    await this.showManagementPanelTab();
                    return browser.history.deleteUrl({
                        'url': MANAGEMENT_URL
                    });
            }
        },

        /**
         * Shows the management panel in a new window (focuses the window if it was already open in the background)
         */
        'showManagementPanelWindow': async function () {
            console.log('[Background] Management.showManagementPanelWindow()');

            const windows = await browser.windows.getAll({
                'populate': true,
                'windowTypes': [WINDOW_TYPE]
            });

            if (windows.length) {
                for (const window of windows) {
                    if (window.type === WINDOW_TYPE) {
                        console.log('Looking for management panel URL in window\'s tabs', window);
                        const tabs = window.tabs.filter((tab) => tab.url === MANAGEMENT_URL);
                        if (tabs.length) {
                            console.log('Reusing an existing window for management panel', window);
                            return browser.windows.update(window.id, {
                                'focused': true
                            });
                        }
                    }
                }
            }

            console.log('Opening a new window for management panel');
            return browser.windows.create({
                'url': MANAGEMENT_URL,
                'type': WINDOW_TYPE
            });
        },

        /**
         * Shows the management panel in a tab in the current window (focuses the tab if it was already open in the background)
         */
        'showManagementPanelTab': async function () {
            console.log('[Background] Management.showManagementPanelTab()');

            const tabs = await browser.tabs.query({
                'currentWindow': true,
                'url': MANAGEMENT_URL
            });

            if (tabs.length) {
                console.log('Reusing an existing tab for management panel', tabs[0]);
                return browser.tabs.update(tabs[0].id, {
                    'active': true
                });
            }

            console.log('Opening a new tab for management panel');
            return browser.tabs.create({
                'url': MANAGEMENT_URL,
            });
        },

        /**
         * Send a message to the management panel(s)
         * @param {string} message the message to send
         */
        'sendMessageToManagementPanel': async function (message) {
            console.log('[Background] Management.sendMessageToManagementPanel()');

            return BrowserTabs.sendMessageToAllTabs(message, MANAGEMENT_URL);
        }

    };

    return Management;

})();

export default Management;
