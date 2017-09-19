import BrowserTabs from './browser-tabs';

import UsersFilter from './filter-classes/UsersFilter.js';

const Filters = (() => {

    const AVIALABLE_FILTERS = [
        UsersFilter
    ]

    class Filters {

        /**
         *
         * @param {tab} tab
         */
        applyAllFiltersToTab(tab) {
            console.log('applyAllFiltersToTab()', tab);

            return new Promise((resolve, reject) => {

                let promises = [];

                AVIALABLE_FILTERS.forEach((filter) => {

                    filter.getFilterData().then((data) => {

                        data.forEach((item) => {
                            promises.push(BrowserTabs.addCSSToTab(filter.getCSS(item), tab));
                        }, this);

                    });

                }, this);

                return Promise.all(promises).then((results) => {
                    console.log(results);
                    resolve(results);
                }).catch((error) => {
                    console.error(error);
                    reject(error);
                });

            });
        }

        /**
         *
         */
        getAvailableFilters() {
            return AVIALABLE_FILTERS;
        }

        /**
         *
         */
        getFiltersMetaData() {
            console.log('getFiltersMetaData()');

            return new Promise((resolve, reject) => {

                let meta = [];

                AVIALABLE_FILTERS.forEach((filter) => {
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
        getFilterData(id, limit, offset) {
            console.log('getFilterData()', id, limit, offset);

            return new Promise((resolve, reject) => {

                let found = false;

                AVIALABLE_FILTERS.forEach((filter) => {

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
        addFilterItem(id, item) {
            console.log('addFilterItem', id, item);

            return new Promise((resolve, reject) => {

                let found = false;

                AVIALABLE_FILTERS.forEach((filter) => {

                    if (filter.id == id) {

                        found = true;

                        filter.add(item).then((filters) => {
                            console.log('Filter item has been removed');
                            BrowserTabs.addCSSToAllTabs(filter.getCSS(item));
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
        removeFilterItem(id, item) {
            console.log('removeFilterItem', id, item);

            return new Promise((resolve, reject) => {

                let found = false;

                AVIALABLE_FILTERS.forEach((filter) => {

                    if (filter.id == id) {

                        found = true;

                        filter.remove(item).then((filters) => {
                            console.log('Filter item has been removed');
                            BrowserTabs.removeCSSFromAllTabs(filter.getCSS(item));
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
        toggleFilterItem(id, item) {
            console.log('toggleFilterItem', id, item);

            return new Promise((resolve, reject) => {

                let found = false;

                AVIALABLE_FILTERS.forEach((filter) => {

                    if (filter.id == id) {

                        found = true;

                        filter.toggle(item).then((filters) => {
                            console.log('Filter item has been toggled');
                            filter.exists(item).then((exists) => {
                                console.log('Filter item exists now?', exists);
                                if (exists) {
                                    BrowserTabs.addCSSToAllTabs(filter.getCSS(item));
                                } else {
                                    BrowserTabs.removeCSSFromAllTabs(filter.getCSS(item));
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
    }

    return new Filters();

})();

export default Filters;
