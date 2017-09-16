browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('browser.tabs.onUpdated()', tabId, changeInfo, tab);
    if (!changeInfo.url) {
        return;
    }

    if (/^https?:\/\/(\S+\.){0,}deviantart\.com/i.test(tab.url)) {
        browser.pageAction.show(tab.id);
        browser.storage.sync.get('pageActionPopupMenu').then((res) => {
            togglePageActionPopupMenu(res.pageActionPopupMenu);
        });
    } else {
        browser.pageAction.hide(tab.id);
    }
});

browser.pageAction.onClicked.addListener((tab) => {
    console.log('browser.pageAction.onClicked()', tab);
    return showManagementPanel(tab);
});

browser.runtime.onInstalled.addListener((details) => {
    console.log('browser.runtime.onInstalled()', details);
    switch (details.reason) {
        case 'install':
            console.log('The extension was installed' + (details.temporary ? ' temporarilly' : '') + '.');
            initDefaultOptions();
            initPageAction();
            break;

        case 'update':
            console.log('The extension was updated to a new version:', details.previousVersion);
            initDefaultOptions();
            initPageAction();
            break;

        case 'browser_update':
        case 'chrome_update':
            console.log('The browser was updated to a new version.');
            break;

        case 'shared_module_update':
            console.log('Another extension (ID: ' + details.id + '), which contains a module used by this extension, was updated.');
            break;
    }
});

// listen for messages from the extension and the content script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('browser.runtime.onMessage()', request, sender, sendResponse);

    if (request.action === undefined) {
        console.error(`recieved message without action property`);
        return false;
    }

    switch (request.action) {
        case 'init':
            return Promise.resolve(true);

        case 'show-management-panel':
            return showManagementPanel();

        case 'get-options':
            return getOptions();

        case 'set-option':
            return setOption(request.data.option, request.data.value);

        case 'get-filters':
            return getFilters();

        case 'get-filter-data':
            return getFilterData(request.data.filter);

        case 'add-filter-item':
            return addFilterItem(request.data.filter, request.data.item);

        case 'remove-filter-item':
            return removeFilterItem(request.data.filter, request.data.item);

        default:
            console.error(`no logic defined for action '${request.action}'`);
            return Promise.resolve(null);
    }
});

browser.storage.onChanged.addListener((changes, area) => {
    console.log('browser.storage.onChanged()', changes, area);
    switch (area) {
        case 'sync': return onSyncStorageChange(changes);
        case 'local': return onLocalStorageChange(changes);
        case 'managed': return onManagedStorageChange(changes);
    }
});

/**
 *
 * @param {object} changes
 */
function onSyncStorageChange(changes) {
    console.log('onSyncStorageChange()', changes);
    return onStorageChange(changes);
}

/**
 *
 * @param {object} changes
 */
function onLocalStorageChange(changes) {
    console.log('onLocalStorageChange()', changes);
    return onStorageChange(changes);
}

/**
 *
 * @param {object} changes
 */
function onManagedStorageChange(changes) {
    console.log('onManagedStorageChange()', changes);
    return onStorageChange(changes);
}

/**
 *
 * @param {objects} changes
 */
function onStorageChange(changes) {
    console.log('onStorageChange()', changes);
    for (var item of Object.keys(changes)) {
        switch (item) {
            case 'managementPanelType':
                break;

            case 'pageActionPopupMenu':
                return togglePageActionPopupMenu(changes[item].newValue);

            case 'placeholders':
                break;
        }
    }
}

/**
 *
 */
function initDefaultOptions() {
    console.log('initDefaultOptions()');
    browser.storage.sync.get().then((res) => {
        var defaults = {
            'managementPanelType': 'tab',
            'pageActionPopupMenu': true,
            'placeholders': true,
            'privateStorage': 'read'
        };

        var options = {};
        for (var option in defaults) {
            if (res[option] === undefined) {
                options[option] = defaults[option];
            }
        }

        browser.storage.sync.set(options);
    });
}

/**
 *
 * @param {string} option - the key of the option
 * @param {string} value - the value of the option
 */
function setOption(option, value) {
    console.log(`Changing setting "${option}" to "${value}"`);
    var opt = {};
    opt[option] = value;
    return browser.storage.sync.set(opt);
}

/**
 *
 */
function getOptions() {
    console.log('getOptions()');
    var options = ['managementPanelType', 'pageActionPopupMenu', 'placeholders'];
    return browser.storage.sync.get(options).then((res) => {
        var options = [];
        var opt;
        for (var option in res) {
            opt = {
                'id': option,
                'name': browser.i18n.getMessage(`Option${option}Name`),
                'description': browser.i18n.getMessage(`Option${option}Description`),
                'value': res[option]
            };
            switch (option) {
                case 'placeholders':
                case 'pageActionPopupMenu':
                    opt.type = 'checkbox';
                    break;

                case 'managementPanelType':
                    opt.type = 'radio';
                    opt.values = [
                        {
                            'value': 'modal',
                            'label': 'Open as an embedded modal',
                            'disabled': true
                        },
                        {
                            'value': 'window',
                            'label': 'Open as a new window (default)'
                        },
                        {
                            'value': 'tab',
                            'label': 'Open in a new tab'
                        }
                    ]
                    break;

                default:
                    opt.type = 'string';
                    break;
            }
            options.push(opt);
        }

        return { 'options': options };
        /*return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({ 'options': options });
                //reject(new Error('Failed to retrieve options from storage'));
            }, 10000);
        });*/
    });
}

/**
 *
 */
function getFilters() {
    console.log('getFilters()');
    return new Promise((resolve, reject) => {
        resolve({
            'filters': [
                {
                    'id': 'users',
                    'name': {
                        'singular': browser.i18n.getMessage('FilterTypeUsersName'),
                        'plural': browser.i18n.getMessage('FilterTypeUsersNamePlural')
                    },
                    'total': 3,
                    'properties': ['Username'],
                    'labels': {
                        'none': browser.i18n.getMessage('FilterTypeUsersLabelNone'),
                        'help': browser.i18n.getMessage('FilterTypeUsersLabelHelp')
                    }
                },
                {
                    'id': 'tags',
                    'name': {
                        'singular': browser.i18n.getMessage('FilterTypeTagsName'),
                        'plural': browser.i18n.getMessage('FilterTypeTagsNamePlural')
                    },
                    'total': 3,
                    'properties': ['Tag'],
                    'labels': {
                        'none': browser.i18n.getMessage('FilterTypeTagsLabelNone'),
                        'help': browser.i18n.getMessage('FilterTypeTagsLabelHelp')
                    }
                }
            ]
        });
    });
}

/**
 *
 * @param {string} filter - the unique identified of the filter
 */
function getFilterData(filter) {
    console.log('getFilterData()');
    return new Promise((resolve, reject) => {
        var data = [];
        switch (filter) {
            case 'users':
                data.push({ 'username': 'test1' });
                data.push({ 'username': 'test2' });
                data.push({ 'username': 'test3' });
                break;

            case 'tags':
                data.push({ 'tag': 'manip' });
                data.push({ 'tag': 'painting' });
                data.push({ 'tag': 'deviant' });
                break;
        }
        setTimeout(() => {
            resolve({ 'data': data });
        }, 3000);
    });
}

/**
 *
 */
function initPageAction() {
    console.log('initPageAction()');
    return Promise.all([
        browser.storage.sync.get('pageActionPopupMenu').then((res) => {
            return togglePageActionPopupMenu(res.pageActionPopupMenu);
        }),
        browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
            tabs.forEach(function (tab) {
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
function setPageActionIcon(type) {
    console.log('setPageActionIcon()', type);
    return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
        tabs.forEach(function (tab) {
            setPageActionIconForTab(tab.id, type);
        }, this);
        return true;
    });
}

/**
 *
 * @param {integer} tabId
 * @param {string} type
 */
function setPageActionIconForTab(tabId, type) {
    console.log('setPageActionIconForTab()', tabId, type);
    return browser.pageAction.setIcon({
        tabId: tabId,
        path: browser.extension.getURL('icons/icon-action-' + type + '.svg')
    });
}

/**
 *
 * @param {boolean} enabled
 */
function togglePageActionPopupMenu(enabled) {
    console.log('togglePageActionPopupMenu()', enabled);
    return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
        tabs.forEach(function (tab) {
            browser.pageAction.setPopup({
                tabId: tab.id,
                popup: enabled ? browser.extension.getURL('pages/popup/popup.html') : ''
            });
        }, this);
        return true;
    });
}

/**
 *
 * @param {*} filter
 * @param {*} item
 */
function addFilterItem(filter, item) {
    console.log('addFilterItem', filter, item);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
            //reject(new Error('Item was already in filter list'));
        }, 1000);
    });
}

/**
 *
 * @param {*} filter
 * @param {*} item
 */
function removeFilterItem(filter, item) {
    console.log('removeFilterItem', filter, item);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
            //reject(new Error('Item was not found in filter list'));
        }, 1000);
    });
}

/**
 *
 * @param {tab} [tab] - the tab that requested the management panel be shown (normally the active tab)
 */
function showManagementPanel(tab) {
    console.log('showManagementPanel()');
    const url = browser.extension.getURL('pages/manage/manage.html');
    return browser.storage.sync.get('managementPanelType').then((res) => {
        console.log('management panel type:', res.managementPanelType);
        switch (res.managementPanelType) {
            case 'window':
                //@TODO look for an existing window showing the management page - if found, switch to it and reload
                return browser.windows.create({
                    url: url,
                    type: 'panel' //'popup'
                }).then(() => {
                    browser.history.deleteUrl({ url: url });
                });

            case 'modal':
                if (tab && tab.id) {
                    return browser.tabs.sendMessage(tab.id, 'show-management-modal');
                } else {
                    return browser.tabs.query({
                        currentWindow: true,
                        active: true
                    }).then((tabs) => {
                        //@TODO is it safe to assume the "active" tab is correct? what if a background script triggers this?
                        return browser.tabs.sendMessage(tabs[0].id, 'show-management-modal');
                    });
                }

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
