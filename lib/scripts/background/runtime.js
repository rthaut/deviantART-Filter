// listen for messages from the extension and the content script
/* global contentScriptLoad showManagementPanel getOptions setOption getFiltersMetaData getFilterData addFilterItem removeFilterItem toggleFilterItem */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('browser.runtime.onMessage()', request, sender, sendResponse);

    if (request.action === undefined) {
        console.error(`recieved message without action property`);
        return false;
    }

    switch (request.action) {
        case 'content-script-load':
            return contentScriptLoad(sender.tab);

        case 'show-management-panel':
            return showManagementPanel();

        case 'get-options':
            return getOptions();

        case 'set-option':
            return setOption(request.data.option, request.data.value);

        case 'get-filters-meta-data':
            return getFiltersMetaData();

        case 'get-filter-data':
            return getFilterData(request.data.filter, request.data.limit, request.data.offset);

        case 'add-filter-item':
            return addFilterItem(request.data.filter, request.data.item);

        case 'remove-filter-item':
            return removeFilterItem(request.data.filter, request.data.item);

        case 'toggle-filter-item':
            return toggleFilterItem(request.data.filter, request.data.item);

        default:
            console.error(`no logic defined for action '${request.action}'`);
            return Promise.resolve(null);
    }
});
