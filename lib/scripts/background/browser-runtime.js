import BrowserPageAction from './browser-page-action';
import ContentScript from './content-script';
import Filters from './filters';
import Management from './management';
import Options from './options';

const BrowserRuntime = (() => {

    class BrowserRuntime {

        onRuntimeMessage(request, sender, sendResponse) {
            console.log('browser.runtime.onMessage()', request, sender, sendResponse);

            if (request.action === undefined) {
                console.error(`recieved message without action property`);
                return false;
            }

            switch (request.action) {
                case 'content-script-load':
                    return ContentScript.onContentScriptLoad(sender.tab);

                case 'show-management-panel':
                    return Management.showManagementPanel();

                case 'get-options':
                    return Options.getOptions();

                case 'set-option':
                    return Options.setOption(request.data.option, request.data.value);

                case 'get-filters-meta-data':
                    return Filters.getFiltersMetaData();

                case 'get-filter-data':
                    return Filters.getFilterData(request.data.filter, request.data.limit, request.data.offset);

                case 'add-filter-item':
                    return Filters.addFilterItem(request.data.filter, request.data.item);

                case 'remove-filter-item':
                    return Filters.removeFilterItem(request.data.filter, request.data.item);

                case 'toggle-filter-item':
                    return Filters.toggleFilterItem(request.data.filter, request.data.item);

                default:
                    console.error(`no logic defined for action '${request.action}'`);
                    return Promise.resolve(null);
            }
        }

        onRuntimeInstalled(details) {
            console.log('browser.runtime.onInstalled()', details);
            switch (details.reason) {
                case 'install':
                    console.log('The extension was installed' + (details.temporary ? ' temporarilly' : '') + '.');
                    Options.initDefaultOptions();
                    BrowserPageAction.initPageAction();
                    break;

                case 'update':
                    console.log('The extension was updated to a new version:', details.previousVersion);
                    Options.initDefaultOptions();
                    BrowserPageAction.initPageAction();
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
