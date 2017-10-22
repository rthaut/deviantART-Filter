import BrowserPageAction from './browser-page-action';
import BrowserTabs from './browser-tabs';
import ContentScript from './content-script';
import Filters from './filters';
import Management from './management';
import Metadata from './metadata';
import Migration from './migration';
import Options from './options';

const BrowserRuntime = (() => {

    class BrowserRuntime {

        onRuntimeMessage(message, sender, sendResponse) {
            console.log('[Background] BrowserRuntime.onRuntimeMessage()', message, sender, sendResponse);

            if (message.action === undefined) {
                console.error('recieved message without action property');
                return false;
            }

            switch (message.action) {
                case 'content-script-load':
                    return ContentScript.onContentScriptLoad(sender.tab);

                case 'show-management-panel':
                    return Management.showManagementPanel();

                case 'get-options':
                    return Options.getOptions();

                case 'set-option':
                    return Options.setOption(message.data.option, message.data.value);

                case 'get-filters-meta-data':
                    return Filters.getFiltersMetaData();

                case 'get-filter-data':
                    return Filters.getFilterData(message.data.filter, message.data.limit, message.data.offset);

                case 'add-filter-item':
                    return Filters.addFilterItem(message.data.filter, message.data.item);

                case 'remove-filter-item':
                    return Filters.removeFilterItem(message.data.filter, message.data.item);

                case 'toggle-filter-item':
                    return Filters.toggleFilterItem(message.data.filter, message.data.item);

                case 'import-filters':
                    return Filters.importFiltersFromFile(message.data.file);

                case 'export-filters':
                    return Filters.exportFilters();

                case 'migrate-filter':
                    return Migration.migrateFilter(message.data.filter, message.data.items);

                case 'get-category-hierarchy':
                    return Metadata.getCategoryHierarchy(message.data);

                default:
                    console.error(`no logic defined for action '${message.action}'`);
                    return Promise.resolve(null);
            }
        }

        onRuntimeInstalled(details) {
            console.log('[Background] BrowserRuntime.onRuntimeInstalled()', details);
            switch (details.reason) {
                case 'install':
                    console.log('The extension was installed' + (details.temporary ? ' temporarilly' : '') + '.');
                    Options.initDefaultOptions();
                    BrowserPageAction.initPageAction();
                    BrowserTabs.reloadTabs();
                    break;

                case 'update':
                    console.log('The extension was updated to a new version:', details.previousVersion);
                    Options.initDefaultOptions();
                    BrowserPageAction.initPageAction();
                    BrowserTabs.reloadTabs();
                    break;

                case 'browser_update':
                case 'chrome_update':
                    console.log('The browser was updated to a new version.');
                    break;

                case 'shared_module_update':
                    console.log('Another extension (ID: ' + details.id + '), which contains a module used by this extension, was updated.');
                    break;
            }
        }
    }

    return new BrowserRuntime();

})();

export default BrowserRuntime;
