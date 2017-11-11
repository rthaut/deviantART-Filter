import BrowserTabs from './browser-tabs';

const Management = (() => {

    const WINDOW_TYPE = 'popup';
    const MANAGEMENT_URL = browser.runtime.getURL('pages/manage/manage.html');

    const Management = {

        /**
         *
         * @param {tab} [tab] - the tab that requested the management panel be shown (normally the active tab)
         */
        'showManagementPanel': function (tab) {
            console.log('[Background] Management.showManagementPanel()', tab);
            return browser.storage.sync.get('managementPanelType').then((data) => {
                switch (data.managementPanelType) {
                    case 'window':
                        console.log('Showing Management Panel in a Window');
                        return browser.windows.getAll({
                            'populate': true,
                            'windowTypes': [WINDOW_TYPE]
                        }).then((windows) => {
                            console.log('Existing Windows', windows);
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
                        }).then(() => {
                            console.log('Removing management panel URL from history');
                            browser.history.deleteUrl({ 'url': MANAGEMENT_URL });
                        });


                    case 'modal':
                        console.log('Showing Management Panel in a modal');
                        return BrowserTabs.sendMessageToTab(tab, 'show-management-modal');

                    case 'tab':
                    default:
                        console.log('Showing Management Panel in a Tab');
                        return browser.tabs.query({
                            'currentWindow': true,
                            'url': MANAGEMENT_URL
                        }).then((tabs) => {
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

                        }).then(() => {
                            console.log('Removing management panel URL from history');
                            browser.history.deleteUrl({ 'url': MANAGEMENT_URL });
                        });

                }
            });
        }

    };

    return Management;

})();

export default Management;
