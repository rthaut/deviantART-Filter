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
                removeFilterCSSFromAllTabs(filter).then(() => {
                    console.log('Filter CSS has been removed from all tabs');
                    return filter.add(item);
                }).then((filters) => {
                    addFilterCSSToAllTabs(filter);
                    resolve({ 'data': filters });
                }).catch((error) => {
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
                removeFilterCSSFromAllTabs(filter).then(() => {
                    console.log('Filter CSS has been removed from all tabs');
                    return filter.remove(item);
                }).then((filters) => {
                    addFilterCSSToAllTabs(filter);
                    resolve({ 'data': filters });
                }).catch((error) => {
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
 * @param {*} filter
 * @param {tab} tab - the tab to which the filter's CSS should be applied
 */
/* exported addFilterCSSToAllTabs */
function addFilterCSSToAllTabs(filter) {
    console.log('addFilterCSSToAllTabs()', filter);
    return Promise.all([
        browser.tabs.query({ 'url': '*://*.deviantart.com/*' }),
        filter.getCSS()
    ]).then((results) => {
        console.log(results);

        let tabs = results[0];
        let css = results[1];
        let promises = [];
        tabs.forEach((tab) => {
            promises.push(browser.tabs.insertCSS(tab.id, {
                'code': css,
                'cssOrigin': 'author',
                'runAt': 'document_start'
            }));
        }, this);
        return Promise.all(promises);
    }).catch((error) => {
        console.error(error);
        return Promise.reject(error);
    });
}

/**
 *
 * @param {*} filter
 * @param {tab} tab - the tab to which the filter's CSS should be applied
 */
/* exported removeFilterCSSFromAllTabs */
function removeFilterCSSFromAllTabs(filter) {
    console.log('removeFilterCSSFromAllTabs()', filter);
    return Promise.all([
        browser.tabs.query({ 'url': '*://*.deviantart.com/*' }),
        filter.getCSS()
    ]).then((results) => {
        let tabs = results[0];
        let css = results[1];
        let promises = [];
        tabs.forEach((tab) => {
            promises.push(browser.tabs.removeCSS(tab.id, {
                'code': css,
                'cssOrigin': 'author',
                'runAt': 'document_start'
            }));
        }, this);
        return Promise.all(promises);
    }).catch((error) => {
        console.error(error);
        return Promise.reject(error);
    });
}

/**
 *
 * @param {*} filter
 * @param {tab} tab - the tab to which the filter's CSS should be applied
 */
/* exported applyFilterCSSToTab */
function addFilterCSSToTab(filter, tab) {
    console.log('applyFilterCSSToTab()', filter, tab);
    return filter.getCSS().then((css) => {
        console.log(css);
        return browser.tabs.insertCSS(tab.id, {
            'code': css,
            'cssOrigin': 'author',
            'runAt': 'document_start'
        });
    }).catch((error) => {
        console.error(error);
        return Promise.reject(error);
    });
}

/**
 *
 * @param {*} filter
 * @param {tab} tab - the tab to which the filter's CSS should be applied
 */
/* exported removeFilterCSSFromTab */
function removeFilterCSSFromTab(filter, tab) {
    console.log('removeFilterCSSFromTab()', filter, tab);
    return filter.getCSS().then((css) => {
        console.log(css);
        return browser.tabs.removeCSS(tab.id, {
            'code': css,
            'cssOrigin': 'author',
            'runAt': 'document_start'
        });
    }).catch((error) => {
        console.error(error);
        return Promise.reject(error);
    });
}
