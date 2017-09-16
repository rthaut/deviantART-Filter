browser.storage.onChanged.addListener((changes, area) => {
    console.log('browser.storage.onChanged()', changes, area);
    switch (area) {
        case 'sync': return onSyncStorageChange(changes);
        case 'local': return onLocalStorageChange(changes);
        case 'managed': return onManagedStorageChange(changes);
    }
});

/**
 * Handler for all changes to data in synchronized storage area
 * @param {object} changes - object describing the change
 */
/* exported onSyncStorageChange */
function onSyncStorageChange(changes) {
    console.log('onSyncStorageChange()', changes);
    return onStorageChange(changes);
}

/**
 * Handler for all changes to data in local storage area
 * @param {object} changes - object describing the change
 */
/* exported onLocalStorageChange */
function onLocalStorageChange(changes) {
    console.log('onLocalStorageChange()', changes);
    return onStorageChange(changes);
}

/**
 * Handler for all changes to data in managed storage area
 * @param {object} changes - object describing the change
 */
/* exported onManagedStorageChange */
function onManagedStorageChange(changes) {
    console.log('onManagedStorageChange()', changes);
    return onStorageChange(changes);
}

/**
 * Handler for all changes to storage data, regardless of storage area/type
 * @param {object} changes - object describing the change
 */
/* global togglePageActionPopupMenu sendMessageToAllTabs */
/* exported onStorageChange */
function onStorageChange(changes) {
    console.log('onStorageChange()', changes);
    for (var item of Object.keys(changes)) {
        switch (item) {
            case 'managementPanelType':
                break;

            case 'pageActionPopupMenu':
                return togglePageActionPopupMenu(changes[item].newValue);

            case 'placeholders':
                sendMessageToAllTabs('toggle-placeholders');
        }
    }
}
