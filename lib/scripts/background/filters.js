import UsersFilter from './filter-classes/UsersFilter.class.js';
import TagsFilter from './filter-classes/TagsFilter.class.js';

const Filters = (() => {

    const AVIALABLE_FILTERS = [
        new UsersFilter(),
        new TagsFilter()
    ];

    class Filters {

        importFilters(data) {
            console.log('[Background] Filters.importFilters()', data);

            return new Promise((resolve, reject) => {
                var reader = new FileReader();
                reader.onerror = (event) => {
                    console.error(event);
                    reject(event);
                };
                reader.onload = (event) => {
                    console.log(event);
                    console.log(reader.result);
                    const data = JSON.parse(reader.result);
                    const filters = Object.keys(data);
                    const promises = [];
                    filters.forEach((id) => {
                        const filter = AVIALABLE_FILTERS.find((filter) => filter.id === id);
                        if (filter !== undefined && filter !== null) {
                            promises.push(filter.import(data[id]));
                        } else {
                            promises.push(Promise.resolve({'error': `Unknown filter type "${id}"`}));   //@TODO i18n
                        }
                    });
                    Promise.all(promises).then((results) => {
                        console.log(results);
                        const response = {};
                        for (let i = 0; i < filters.length; i++) {
                            response[filters[i]] = results[i];
                            browser.runtime.sendMessage({ 'action': 'filter-updated', 'data': { 'filter': filters[i] } });
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
        applyFiltersToTab(tab) {
            console.log('[Background] Filters.applyAllFiltersToTab()', tab);

            return new Promise((resolve, reject) => {

                let promises = [];

                AVIALABLE_FILTERS.forEach((filter) => {
                    promises.push(filter.applyFilter(tab));
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
            console.log('[Background] Filters.getFiltersMetaData()');

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
            console.log('[Background] Filters.getFilterData()', id, limit, offset);

            return new Promise((resolve, reject) => {

                const filter = AVIALABLE_FILTERS.find((element) => element.id === id);
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
            console.log('[Background] Filters.addFilterItem', id, item);

            return new Promise((resolve, reject) => {

                const filter = AVIALABLE_FILTERS.find((element) => element.id === id);
                if (filter === undefined || filter === null) {
                    reject(new Error(`Filter ${id} not found`));    //@TODO i18n
                    return;
                }

                filter.add(item).then((data) => {
                    console.log('Filter item has been removed');
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
        removeFilterItem(id, item) {
            console.log('[Background] Filters.removeFilterItem', id, item);

            return new Promise((resolve, reject) => {

                const filter = AVIALABLE_FILTERS.find((element) => element.id === id);
                if (filter === undefined || filter === null) {
                    reject(new Error(`Filter ${id} not found`));    //@TODO i18n
                    return;
                }

                filter.remove(item).then((data) => {
                    console.log('Filter item has been removed');
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
        toggleFilterItem(id, item) {
            console.log('[Background] Filters.toggleFilterItem', id, item);

            return new Promise((resolve, reject) => {

                const filter = AVIALABLE_FILTERS.find((element) => element.id === id);
                if (filter === undefined || filter === null) {
                    reject(new Error(`Filter ${id} not found`));    //@TODO i18n
                    return;
                }

                filter.toggle(item).then((data) => {
                    console.log('Filter item has been toggled');
                    browser.runtime.sendMessage({ 'action': 'filter-updated', 'data': { 'filter': filter.id } });
                    resolve({ 'data': data });
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
