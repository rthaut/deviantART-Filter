import BrowserTabs from './browser-tabs';

import UsersFilter from './filter-classes/UsersFilter.class.js';

const Filters = (() => {

    const AVIALABLE_FILTERS = [
        new UsersFilter()
    ]

    class Filters {

        importFilters(data) {
            console.log('importFilters()', data);

            return new Promise((resolve, reject) => {
                var reader = new FileReader();
                reader.onerror = (event) => {
                    console.error(event);
                    reject(error);
                };
                reader.onload = (event) => {
                    console.log(event);
                    //console.log(reader.result);
                    let data = JSON.parse(reader.result);
                    let filters = Object.keys(data);
                    let promises = [];
                    filters.forEach((id) => {
                        let filter = AVIALABLE_FILTERS.find((element) => element.id == id);
                        if (filter !== undefined && filter !== null) {
                            promises.push(filter.import(data[id]));
                        } else {
                            promises.push(Promise.resolve({'error': `Unknown filter type "${id}"`}));   //@TODO i18n
                        }
                    });
                    Promise.all(promises).then((results) => {
                        console.log(results);
                        let response = {};
                        for (let i = 0; i < filters.length; i++) {
                            response[filters[i]] = results[i];
                        }
                        resolve(response);
                    });
                };
                reader.onprogress = (event) => {
                    console.log(event);
                };
                reader.readAsText(data.file);
            });
        }

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

                let filter = AVIALABLE_FILTERS.find((element) => element.id == id);
                if (filter === undefined || filter === null) {
                    reject(new Error(`Filter ${id} not found`));    //@TODO i18n
                    return;
                }

                filter.getFilterData(limit, offset).then((data) => {
                    resolve({ 'data': data });
                }).catch((error) => {
                    console.error(error);
                    reject(error);
                });

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

                let filter = AVIALABLE_FILTERS.find((element) => element.id == id);
                if (filter === undefined || filter === null) {
                    reject(new Error(`Filter ${id} not found`));    //@TODO i18n
                    return;
                }

                filter.add(item).then((filters) => {
                    console.log('Filter item has been removed');
                    BrowserTabs.addCSSToAllTabs(filter.getCSS(item));
                    resolve({ 'data': filters });
                }).catch((error) => {
                    console.error(error);
                    reject(error);
                });

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

                let filter = AVIALABLE_FILTERS.find((element) => element.id == id);
                if (filter === undefined || filter === null) {
                    reject(new Error(`Filter ${id} not found`));    //@TODO i18n
                    return;
                }

                filter.remove(item).then((filters) => {
                    console.log('Filter item has been removed');
                    BrowserTabs.removeCSSFromAllTabs(filter.getCSS(item));
                    resolve({ 'data': filters });
                }).catch((error) => {
                    console.error(error);
                    reject(error);
                });

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

                let filter = AVIALABLE_FILTERS.find((element) => element.id == id);
                if (filter === undefined || filter === null) {
                    reject(new Error(`Filter ${id} not found`));    //@TODO i18n
                    return;
                }

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

            });
        }
    }

    return new Filters();

})();

export default Filters;
