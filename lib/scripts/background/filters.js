import UsersFilter from './filter-classes/UsersFilter.class';
import TagsFilter from './filter-classes/TagsFilter.class';
import CategoriesFilter from './filter-classes/CategoriesFilter.class';

import BrowserTabs from './browser-tabs';

const Filters = (() => {

    const AVAILABLE_FILTERS = [
        new UsersFilter(),
        new TagsFilter(),
        new CategoriesFilter()
    ];

    const Filters = {

        /**
         * Imports data for filters from a JSON file
         * @param {Blob} blob
         */
        'importFiltersFromFile': function (blob) {
            console.log('[Background] Filters.importFiltersFromFile()', blob);

            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onerror = (event) => {
                    console.error('[Background] Filters.importFiltersFromFile() :: Error', event);
                    reject(event);
                };

                reader.onload = (event) => {
                    console.log(event);
                    console.log(reader.result);
                    let data;
                    try {
                        data = JSON.parse(reader.result);
                    } catch (error) {
                        console.error('[Background] Filters.importFiltersFromFile() :: JSON Parse Error', error);
                        reject(error);
                    }

                    if (data !== undefined && data !== null) {
                        this.importFiltersFromObject(data).then(resolve, reject);
                    }
                };

                reader.onprogress = (event) => {
                    console.log(event);
                };

                reader.readAsText(blob);
            });
        },

        /**
         * Imports data for filters from an object
         * @param {object} data
         */
        'importFiltersFromObject': function (data) {
            console.log('[Background] Filters.importFiltersFromObject()', data);

            const filters = Object.keys(data);

            const response = {
                'results': {},
                'metadata': {
                    'headers': {
                        'total': browser.i18n.getMessage('ImportResultsTotalHeader'),
                        'success': browser.i18n.getMessage('ImportResultsSuccessHeader'),
                        'invalid': browser.i18n.getMessage('ImportResultsInvalidHeader'),
                        'duplicate': browser.i18n.getMessage('ImportResultsDuplicateHeader')
                    }
                }
            };

            const promises = [];
            filters.forEach((id) => {
                promises.push(this.importFilterData(id, data[id]));
            });

            return Promise.all(promises).then((results) => {
                console.log('[Background] Filters.importFiltersFromObject() :: Results', results);

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

                console.log('[Background] Filters.importFiltersFromObject() :: Response', response);
                return response;
            });
        },

        /**
         * Imports data into the specified filter
         * @param {string} id - filter unique identifier
         * @param {object[]} items
         */
        'importFilterData': async function (id, items) {
            console.log('[Background] Filters.importFilterData()', id, items);

            const filter = this.getFilterByID(id);
            if (filter === undefined || filter === null) {
                // NOTE: this returns an object with an error property (instead of throwing an error)
                // so that the Promise.all() used in importFiltersFromObject() doesn't stop early
                return { 'error': browser.i18n.getMessage('LabelUnknownFilterTypePlaceholder', [id]) };
            }

            try {
                const results = await filter.import(items);
                console.log('[Background] Filters.importFilterData() :: Results', results);

                // notify the Management screen (if it is open) that the filter was updated (so it can be refreshed)
                // TODO: this is just sending the message to the active tab, which works ASSUMING the user still has
                // the Management screen open. It should do a search for the Management screen's URL instead...
                BrowserTabs.sendMessageToTab(null, {
                    'action': 'filter-updated',
                    'data': {
                        'filter': filter.id
                    }
                });

                return results;
            } catch (error) {
                console.error('[Background] Filters.importFilterData() :: Error', error);
                // NOTE: this returns an object with an error property (instead of throwing an error)
                // so that the Promise.all() used in importFiltersFromObject() doesn't stop early
                return { 'error': error.message || error };
            }

        },

        /**
         * Exports data for all filters to an object
         */
        'exportFilters': function () {
            console.log('[Background] Filters.exportFilters()');

            const promises = [];
            AVAILABLE_FILTERS.forEach((filter) => {
                promises.push(filter.getItems());
            });

            return Promise.all(promises).then((results) => {
                const data = {};
                for (let i = 0; i < AVAILABLE_FILTERS.length; i++) {
                    data[AVAILABLE_FILTERS[i].id] = results[i];
                }
                return Promise.resolve(data);
            }).catch((error) => {
                console.error('[Background] Filters.exportFilters() :: Error', error);
                return Promise.reject(error);
            });
        },

        /**
         *
         * @param {tab} tab
         */
        'sendFilterDataToTab': function (tab) {
            console.log('[Background] Filters.applyAllFiltersToTab()', tab);

            const promises = [];
            AVAILABLE_FILTERS.forEach((filter) => {
                promises.push(filter.sendFilterDataToTab(tab));
            });

            return Promise.all(promises).then((results) => {
                console.log('[Background] Filters.applyAllFiltersToTab() :: Results', results);
                return Promise.resolve(results);
            }).catch((error) => {
                console.error('[Background] Filters.applyAllFiltersToTab() :: Error', error);
                return Promise.reject(error);
            });
        },

        /**
         *
         * @param {string} id - filter unique identifier
         */
        'getFilterByID': function (id) {
            console.log('[Background] Filters.getFilterByID()', id);

            return AVAILABLE_FILTERS.find((filter) => (filter.id === id) || (filter.name === id));
        },

        /**
         *
         */
        'getAvailableFilters': function () {
            console.log('[Background] Filters.getAvailableFilters()');

            return AVAILABLE_FILTERS;
        },

        /**
         *
         */
        'getFiltersMetaData': function () {
            console.log('[Background] Filters.getFiltersMetaData()');

            const meta = [];

            AVAILABLE_FILTERS.forEach((filter) => {
                meta.push(filter.getMetaData());
            });

            return { 'filters': meta };
        },

        /**
         *
         * @param {string} id - filter unique identifier
         * @param {number} [limit] - upper limit
         * @param {number} [offset] - starting index
         */
        'getItems': async function (id, limit, offset) {
            console.log('[Background] Filters.getItems()', id, limit, offset);

            const filter = this.getFilterByID(id);
            if (filter === undefined || filter === null) {
                throw new Error(browser.i18n.getMessage('LabelUnknownFilterTypePlaceholder', [id]));
            }

            try {
                const data = await filter.getItems(limit, offset);
                return { 'data': data };
            } catch (error) {
                console.error('[Background] Filters.getItems() :: Error', error);
                throw error;
            }
        },

        /**
         *
         * @param {string} id - filter unique identifier
         * @param {*} item
         */
        'addFilterItem': async function (id, item) {
            console.log('[Background] Filters.addFilterItem()', id, item);

            const filter = this.getFilterByID(id);
            if (filter === undefined || filter === null) {
                throw new Error(browser.i18n.getMessage('LabelUnknownFilterTypePlaceholder', [id]));
            }

            try {
                const data = await filter.add(item);
                console.log('Filter item has been added', data);

                return { 'data': data };
            } catch (error) {
                console.error('[Background] Filters.addFilterItem() :: Error', error);
                throw error;
            }
        },

        /**
         *
         * @param {string} id - filter unique identifier
         * @param {*} item
         */
        'removeFilterItem': async function (id, item) {
            console.log('[Background] Filters.removeFilterItem()', id, item);

            const filter = this.getFilterByID(id);
            if (filter === undefined || filter === null) {
                throw new Error(browser.i18n.getMessage('LabelUnknownFilterTypePlaceholder', [id]));
            }

            try {
                const data = await filter.remove(item);
                console.log('Filter item has been removed');

                return { 'data': data };
            } catch (error) {
                    console.error('[Background] Filters.removeFilterItem() :: Error', error);
                throw error;
            }
        },

        /**
         *
         * @param {string} id - filter unique identifier
         * @param {*} item
         */
        'toggleFilterItem': async function (id, item) {
            console.log('[Background] Filters.toggleFilterItem', id, item);

            const filter = this.getFilterByID(id);
            if (filter === undefined || filter === null) {
                throw new Error(browser.i18n.getMessage('LabelUnknownFilterTypePlaceholder', [id]));
            }

            try {
                const data = await filter.toggle(item);
                console.log('Filter item has been toggled');

                // this message is primarily for the Management screen (IIRC...)
                browser.runtime.sendMessage({
                    'action': 'filter-updated',
                    'data': {
                        'filter': filter.id
                    }
                });

                return { 'data': data };
            } catch (error) {
                console.error('[Background] Filters.toggleFilterItem() :: Error', error);
                throw error;
            }
        }

    };

    return Filters;

})();

export default Filters;
