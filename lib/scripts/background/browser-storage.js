import BrowserPageAction from './browser-page-action';
import BrowserTabs from './browser-tabs';
import Filters from './filters';

const BrowserStorage = (() => {

    class BrowserStorage {

        onStorageChanged(changes, area) {
            console.log('[Background] Storage.onStorageChanged()', changes, area);
            switch (area) {
                case 'sync': return this.onSyncStorageChanged(changes);
                case 'local': return this.onLocalStorageChanged(changes);
                case 'managed': return this.onManagedStorageChanged(changes);
            }
        }

        /**
         * Handler for all changes to data in synchronized storage area
         * @param {object} changes - object describing the change
         */
        onSyncStorageChanged(changes) {
            console.log('[Background] Storage.onSyncStorageChanged()', changes);
            for (const item of Object.keys(changes)) {
                switch (item) {
                    case 'pageActionPopupMenu':
                        return BrowserPageAction.togglePageActionPopupMenu(changes[item].newValue);

                    case 'placeholders':
                        return BrowserTabs.sendMessageToAllTabs('toggle-placeholders');
                }
            }
        }

        /**
         * Handler for all changes to data in local storage area
         * @param {object} changes - object describing the change
         */
        onLocalStorageChanged(changes) {
            console.log('[Background] Storage.onLocalStorageChanged()', changes);
            for (const item of Object.keys(changes)) {
                const filter = Filters.getAvailableFilters().find((filter) => filter.id == item);
                if (filter !== undefined && filter !== null) {
                    filter.updateFilterCSS();
                }
            }
        }

        /**
         * Handler for all changes to data in managed storage area
         * @param {object} changes - object describing the change
         */
        onManagedStorageChanged(changes) {
            console.log('[Background] Storage.onManagedStorageChanged()', changes);
        }

        /**
         * Handler for all changes to storage data, regardless of storage area/type
         * @param {object} changes - object describing the change
         */
        onAnyStorageChanged(changes) {
            console.log('[Background] Storage.onAnyStorageChanged()', changes);
        }

    }

    return new BrowserStorage();

})();

export default BrowserStorage;
