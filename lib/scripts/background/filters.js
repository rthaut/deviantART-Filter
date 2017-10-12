import UsersFilter from './filter-classes/UsersFilter.class.js';
import TagsFilter from './filter-classes/TagsFilter.class.js';

const Filters = (() => {

    const AVIALABLE_FILTERS = [
        new UsersFilter(),
        new TagsFilter()
    ];

    class Filters {

        /**
         *
         * @param {Blob} blob
         */
        importFiltersFromFile(blob) {
            console.log('[Background] Filters.importFiltersFromFile()', blob);

            const response = {
                'results': {},
                'metadata': {
                    'headers': {
                        'total': browser.i18n.getMessage('LabelTotal'),
                        'success': browser.i18n.getMessage('LabelSuccess'),
                        'invalid': browser.i18n.getMessage('LabelInvalid'),
                        'duplicate': browser.i18n.getMessage('LabelDuplicate')
                    }
                }
            };

            return new Promise((resolve, reject) => {
                var reader = new FileReader();

                reader.onerror = (event) => {
                    console.error('[Background] Filters.importFiltersFromFile() :: Error', event);
                    reject(event);
                };

                reader.onload = (event) => {
                    console.log(event);
                    console.log(reader.result);
                    let data, filters;
                    try {
                        data = JSON.parse(reader.result);
                        filters = Object.keys(data);
                    } catch (error) {
                        console.error('[Background] Filters.importFiltersFromFile() :: JSON Parse Error', error);
                        reject(error);
                        return;
                    }

                    const promises = [];
                    filters.forEach((id) => {
                        promises.push(this.importFilterData(id, data[id]));
                    });

                    Promise.all(promises).then((results) => {
                        console.log('[Background] Filters.importFiltersFromFile() :: Results', results);

                        for (let id = 0; id < filters.length; id++) {

                            let key = filters[id];
                            if (!results[id].error) {
                                const filter = this.getFilterByID(id);
                                if (filter !== undefined && filter !== null) {
                                    key = filter.name;
                                }
                            }

                            response.results[key] = results[id];
                        }

                        resolve(response);
                    });
                };

                reader.onprogress = (event) => {
                    console.log(event);
                };

                reader.readAsText(blob);
            });
        }

        /**
         *
         * @param {string} id - filter unique identifier
         * @param {object[]} items
         */
        importFilterData(id, items) {
            console.log('[Background] Filters.importFilterData()', id, items);

            return new Promise((resolve, reject) => {

                const filter = this.getFilterByID(id);
                if (filter === undefined || filter === null) {
                    // NOTE: this is not a reject (like it is everywhere else) to avoid any Promise.all uses being rejected
                    resolve({ 'error': browser.i18n.getMessage('LabelUnknownFilterTypePlaceholder', [id]) });
                    return;
                }

                return filter.import(items).then((results) => {
                    console.log('[Background] Filters.importFilterData() :: Results', results);

                    browser.runtime.sendMessage({
                        'action': 'filter-updated',
                        'data': {
                            'filter': filter.id
                        }
                    });

                    resolve(results);
                }).catch((error) => {
                    console.error('[Background] Filters.importFilterData() :: Error', error);
                    // NOTE: this is not a reject (like it is everywhere else) to avoid any Promise.all uses being rejected
                    resolve({ 'error': error.message || error });
                });

            });
        }

        /**
         *
         */
        exportFilters() {
            console.log('[Background] Filters.exportFilters()');

            return new Promise((resolve, reject) => {

                const promises = [];
                AVIALABLE_FILTERS.forEach((filter) => {
                    promises.push(filter.getFilterData());
                });

                Promise.all(promises).then((results) => {
                    const data = {};
                    for (let i = 0; i < AVIALABLE_FILTERS.length; i++) {
                        data[AVIALABLE_FILTERS[i].id] = results[i];
                    }
                    resolve(data);
                }).catch((error) => {
                    console.error('[Background] Filters.exportFilters() :: Error', error);
                    reject(error);
                });

            });
        }

        /**
         *
         * @param {tab} tab
         */
        sendFilterDataToTab(tab) {
            console.log('[Background] Filters.applyAllFiltersToTab()', tab);

            return new Promise((resolve, reject) => {

                const promises = [];

                AVIALABLE_FILTERS.forEach((filter) => {
                    promises.push(filter.sendFilterDataToTab(tab));
                });

                return Promise.all(promises).then((results) => {
                    console.log('[Background] Filters.applyAllFiltersToTab() :: Results', results);
                    resolve(results);
                }).catch((error) => {
                    console.error('[Background] Filters.applyAllFiltersToTab() :: Error', error);
                    reject(error);
                });

            });
        }

        /**
         *
         * @param {string} id - filter unique identifier
         */
        getFilterByID(id) {
            console.log('[Background] Filters.getFilterByID()', id);

            return AVIALABLE_FILTERS.find((filter) => (filter.id === id) || (filter.name === id));
        }

        /**
         *
         */
        getAvailableFilters() {
            console.log('[Background] Filters.getAvailableFilters()');

            return AVIALABLE_FILTERS;
        }

        /**
         *
         */
        getFiltersMetaData() {
            console.log('[Background] Filters.getFiltersMetaData()');

            return new Promise((resolve, reject) => {

                const meta = [];

                AVIALABLE_FILTERS.forEach((filter) => {
                    meta.push(filter.getMetaData());
                });

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
            console.log('[Background] Filters.getFilterData()', id, limit, offset);

            return new Promise((resolve, reject) => {

                const filter = this.getFilterByID(id);
                if (filter === undefined || filter === null) {
                    reject(new Error(browser.i18n.getMessage('LabelUnknownFilterTypePlaceholder', [id])));
                    return;
                }

                filter.getFilterData(limit, offset).then((data) => {
                    resolve({ 'data': data });
                }).catch((error) => {
                    console.error('[Background] Filters.getFilterData() :: Error', error);
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
            console.log('[Background] Filters.addFilterItem()', id, item);

            return new Promise((resolve, reject) => {

                const filter = this.getFilterByID(id);
                if (filter === undefined || filter === null) {
                    reject(new Error(browser.i18n.getMessage('LabelUnknownFilterTypePlaceholder', [id])));
                    return;
                }

                filter.add(item).then((data) => {
                    console.log('Filter item has been added');
                    /*browser.runtime.sendMessage({
                        'action': 'filter-updated',
                        'data': {
                            'filter': filter.id
                        }
                    });*/
                    resolve({ 'data': data });
                }).catch((error) => {
                    console.error('[Background] Filters.addFilterItem() :: Error', error);
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
            console.log('[Background] Filters.removeFilterItem()', id, item);

            return new Promise((resolve, reject) => {

                const filter = this.getFilterByID(id);
                if (filter === undefined || filter === null) {
                    reject(new Error(browser.i18n.getMessage('LabelUnknownFilterTypePlaceholder', [id])));
                    return;
                }

                filter.remove(item).then((data) => {
                    console.log('Filter item has been removed');
                    /*browser.runtime.sendMessage({
                        'action': 'filter-updated',
                        'data': {
                            'filter': filter.id
                        }
                    });*/
                    resolve({ 'data': data });
                }).catch((error) => {
                    console.error('[Background] Filters.removeFilterItem() :: Error', error);
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
            console.log('[Background] Filters.toggleFilterItem', id, item);

            return new Promise((resolve, reject) => {

                const filter = this.getFilterByID(id);
                if (filter === undefined || filter === null) {
                    reject(new Error(browser.i18n.getMessage('LabelUnknownFilterTypePlaceholder', [id])));
                    return;
                }

                filter.toggle(item).then((data) => {
                    console.log('Filter item has been toggled');
                    browser.runtime.sendMessage({
                        'action': 'filter-updated',
                        'data': {
                            'filter': filter.id
                        }
                    });
                    resolve({ 'data': data });
                }).catch((error) => {
                    console.error('[Background] Filters.toggleFilterItem() :: Error', error);
                    reject(error);
                });

            });
        }
    }

    return new Filters();

})();

export default Filters;
