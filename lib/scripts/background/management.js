import BrowserTabs from './browser-tabs';

const Management = (() => {

    class Management {

        /**
         *
         * @param {tab} [tab] - the tab that requested the management panel be shown (normally the active tab)
         */
        showManagementPanel(tab) {
            console.log('[Background] Management.showManagementPanel()', tab);
            const url = browser.extension.getURL('pages/manage/manage.html');
            return browser.storage.sync.get('managementPanelType').then((data) => {
                console.log('management panel type:', data.managementPanelType);
                switch (data.managementPanelType) {
                    case 'window':
                        //@TODO look for an existing window showing the management page - if found, switch to it and reload
                        return browser.windows.create({
                            url: url,
                            type: 'panel' //'popup'
                        }).then(() => {
                            browser.history.deleteUrl({ url: url });
                        });

                    case 'modal':
                        return BrowserTabs.sendMessageToTab(tab, 'show-management-modal');

                    case 'tab':
                    default:
                        //@TODO look for an existing tab showing the management page - if found, switch to it and reload
                        return browser.tabs.create({
                            url: browser.extension.getURL('pages/manage/manage.html'),
                        }).then(() => {
                            browser.history.deleteUrl({ url: url });
                        });
                }
            });
        }
    }

    return new Management();

})();

export default Management;
