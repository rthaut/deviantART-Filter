/**
 *
 */
/* global getAvailableFilters */
/* exported getFiltersMetaData */
function getFiltersMetaData() {
    console.log('getFiltersMetaData()');
    return new Promise((resolve, reject) => {
        let meta = [];
        let filters = getAvailableFilters();
        filters.forEach((filter) => {
            meta.push(filter.getMetaData());
        }, this);

        resolve({ 'filters': meta });
    });
}

/**
 *
 * @param {string} id - filter unique identifier
 * @param {integer} [limit] - upper limit
 * @param {integer} [offset] - starting index
 */
/* global getAvailableFilters */
/* exported getFilterData */
function getFilterData(id, limit, offset) {
    console.log('getFilterData()', id, limit, offset);
    return new Promise((resolve, reject) => {

        let found = false;
        let filters = getAvailableFilters();
        filters.forEach((filter) => {
            if (filter.id == id) {
                found = true;
                filter.getFilterData(limit, offset).then((data) => {
                    console.log(data);
                    resolve({ 'data': data });
                }).catch((error) => {
                    console.error(error);
                    reject(error);
                });
            }
        }, this);

        if (!found) {
            reject(new Error(`Filter ${id} not found`));
        }

    });
}

/**
 *
 * @param {string} id - filter unique identifier
 * @param {*} item
 */
/* global getAvailableFilters */
/* exported addFilterItem */
function addFilterItem(id, item) {
    console.log('addFilterItem', id, item);
    return new Promise((resolve, reject) => {

        let found = false;
        let filters = getAvailableFilters();
        filters.forEach((filter) => {
            if (filter.id == id) {
                found = true;
                filter.add(item).then((filters) => {
                    console.log('Filter item has been removed');
                    addCSSToAllTabs(filter.getCSS(item));
                    resolve({ 'data': filters });
                }).catch((error) => {
                    console.error(error);
                    reject(error);
                });
            }
        }, this);

        if (!found) {
            reject(new Error(`Filter ${id} not found`));
        }

    });
}

/**
 *
 * @param {string} id - filter unique identifier
 * @param {*} item
 */
/* global getAvailableFilters */
/* exported removeFilterItem */
function removeFilterItem(id, item) {
    console.log('removeFilterItem', id, item);
    return new Promise((resolve, reject) => {

        let found = false;
        let filters = getAvailableFilters();
        filters.forEach((filter) => {
            if (filter.id == id) {
                found = true;
                filter.remove(item).then((filters) => {
                    console.log('Filter item has been removed');
                    removeCSSFromAllTabs(filter.getCSS(item));
                    resolve({ 'data': filters });
                }).catch((error) => {
                    console.error(error);
                    reject(error);
                });
            }
        }, this);

        if (!found) {
            reject(new Error(`Filter ${id} not found`));
        }

    });
}

/**
 *
 * @param {string} id - filter unique identifier
 * @param {*} item
 */
/* global getAvailableFilters */
/* exported toggleFilterItem */
function toggleFilterItem(id, item) {
    console.log('toggleFilterItem', id, item);
    return new Promise((resolve, reject) => {

        let found = false;
        let filters = getAvailableFilters();
        filters.forEach((filter) => {
            if (filter.id == id) {
                found = true;
                filter.toggle(item).then((filters) => {
                    console.log('Filter item has been toggled');
                    filter.exists(item).then((exists) => {
                        console.log('Filter item exists now?', exists);
                        if (exists) {
                            addCSSToAllTabs(filter.getCSS(item));
                        } else {
                            removeCSSFromAllTabs(filter.getCSS(item));
                        }
                    })
                    resolve({ 'data': filters });
                }).catch((error) => {
                    console.error(error);
                    reject(error);
                });
            }
        }, this);

        if (!found) {
            reject(new Error(`Filter ${id} not found`));
        }

    });
}

/**
 *
 * @param {string} css - the CSS to apply to a tab
 * @param {tab} tab - the tab to which the CSS should be applied
 */
/* exported addCSSToTab */
function addCSSToTab(css, tab) {
    console.log('addCSSToTab()', css, tab);
    return browser.tabs.insertCSS(tab.id, {
        'code': css,
        'cssOrigin': 'author',
        'runAt': 'document_start'
    });
}

/**
 *
 * @param {string} css - the CSS to remove from a tab
 * @param {tab} tab - the tab to which the CSS should be applied
 */
/* exported removeCSSFromTab */
function removeCSSFromTab(css, tab) {
    console.log('removeCSSFromTab()', css, tab);
    return browser.tabs.removeCSS(tab.id, {
        'code': css,
        'cssOrigin': 'author',
        'runAt': 'document_start'
    });
}

/**
 *
 * @param {string} css - the CSS to apply to all tabs
 */
/* exported addCSSToAllTabs */
function addCSSToAllTabs(css) {
    console.log('addCSSToAllTabs()', css);
    return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
        let promises = [];
        tabs.forEach((tab) => {
            promises.push(addCSSToTab(css, tab));
        }, this);
        return Promise.all(promises);
    }).catch((error) => {
        console.error(error);
        return Promise.reject(error);
    });
}

/**
 *
 * @param {string} css - the CSS to remove from all tabs
 */
/* exported removeCSSFromAllTabs */
function removeCSSFromAllTabs(css) {
    console.log('removeCSSFromAllTabs()', css);
    return browser.tabs.query({ 'url': '*://*.deviantart.com/*' }).then((tabs) => {
        let promises = [];
        tabs.forEach((tab) => {
            promises.push(removeCSSFromTab(css, tab));
        }, this);
        return Promise.all(promises);
    }).catch((error) => {
        console.error(error);
        return Promise.reject(error);
    });
}
