import Utils from '../../../helpers/utils.js';
import BrowserTabs from '../browser-tabs.js'

const Filter = (() => {

    let currentFilterCSS = null;

    class Filter {

        constructor(id, name, properties) {
            this.id = id;
            this.name = name;
            this.properties = properties;
        }

        get currentFilterCSS() {
            return currentFilterCSS;
        }

        set currentFilterCSS(css) {
            currentFilterCSS = css;
        }

        getDisplayLabel(item) {
            let label = browser.i18n.getMessage(`FilterType${this.name}Name`);
            const properties = this.properties.required.map(property => property.field);
            if (properties.length) {
                // include the first required property, assuming it is the most important
                label += ` "${item[properties[0]]}"`;
            }
            return label;
        }

        /**
         * Gets the meta data for the filter
         * @returns {Object} - The meta data for the filter
         */
        getMetaData() {
            console.log(`${this.name}.getMetaData()`);
            return {
                'id': this.id,
                'name': {
                    'singular': browser.i18n.getMessage(`FilterType${this.name}Name`),
                    'plural': browser.i18n.getMessage(`FilterType${this.name}NamePlural`)
                },
                'properties': this.properties,
                'labels': {
                    'none': browser.i18n.getMessage(`FilterType${this.name}LabelNone`),
                    'help': browser.i18n.getMessage(`FilterType${this.name}LabelHelp`)
                }
            };
        }

        /**
         * Gets the list of filtered items
         * @param {number} [limit] - the limit of filtered items to retrieve
         * @param {number} [offset] - the starting index of filtered items to retrieve
         * @returns {Object[]} - The list of filtered items
         */
        getFilterData(limit, offset) {
            console.log(`${this.name}.getFilterData()`, limit, offset);
            return browser.storage.local.get(this.id).then((data) => {
                if (data[this.id] == undefined) {
                    return [];
                }

                if (limit == undefined || limit == null) {
                    limit = data[this.id].length;
                }

                if (offset == undefined || offset == null) {
                    offset = 0;
                }

                return data[this.id].slice(offset, limit);
            });
        }

        /**
         * Applies CSS for all currently filtered items to a specific tab
         * @param {tab} tab
         */
        applyFilterCSS(tab) {
            console.log(`${this.name}.applyFilterCSS()`, tab);

            return this.getFilterCSS().then((css) => {
                return BrowserTabs.addCSSToTab(css, tab);
            });
        }

        /**
         * Applies CSS for all currently filtered items to all tabs, updating previously applied CSS as needed
         */
        updateFilterCSS() {
            console.log(`${this.name}.updateFilterCSS()`);

            return this.getFilterCSS().then((css) => {

                let promises = [];

                promises.push(BrowserTabs.addCSSToAllTabs(css));

                return Promise.all(promises).then((results) => {

                    if (currentFilterCSS != null && currentFilterCSS != '') {
                        BrowserTabs.removeCSSFromAllTabs(currentFilterCSS);
                    }

                    currentFilterCSS = css;

                    return;
                });

            });
        }

        /**
         * Get the CSS to hide all of the filterable items
         * @returns {string} - The CSS to hide all of the filterable items
         */
        getFilterCSS() {
            console.log(`${this.name}.getFilterCSS()`);

            return new Error('Not implemented');
        }

        /**
         * Normalizes all properties on a filter object
         * @param {object} item - Object represneting a filterable item
         * @returns {object} - The normalized item object
         */
        normalize(item) {
            return item;
        }

        /**
         * Validates all required properties on a filter object
         * @param {object} item - Object represneting a filterable item
         * @returns {boolean} -True if the item is valid
         */
        isValid(item) {
            return item;
        }

        /**
         * Determines if the item is already filtered or not
         * @param {object} item - Object representing a filterable item
         * @returns {boolean} - True if the item is already filtered
         */
        exists(item) {
            console.log(`${this.name}.exists()`, item);

            item = this.normalize(item);

            if (!this.isValid(item)) {
                throw new Error(`${this.getDisplayLabel(item)} is invalid`);    //@TODO i18n
            }

            const properties = this.properties.required.map(property => property.field);

            return this.getFilterData().then((items) => {
                return (Utils.FindObjectInArray(item, items, properties) >= 0);
            });
        }

        import(newItems) {
            console.log(`${this.name}.import()`, newItems);

            const properties = this.properties.required.map(property => property.field);

            let results = {
                'total': newItems.length,
                'success': 0,
                'invalid': 0,
                'duplicate': 0
            };

            return this.getFilterData().then((items) => {

                for (let item of newItems) {
                    item = this.normalize(item);

                    if (!this.isValid(item)) {
                        console.log('Invalid item', item);
                        results.invalid++;
                        continue;
                    }

                    const idx = Utils.FindObjectInArray(item, items, properties);
                    if (idx >= 0) {
                        console.log('Duplicate item', item);
                        results.duplicate++;
                    } else {
                        item.created = Date.now();
                        items.push(item);
                        results.success++;
                    }
                }

                return items;
            }).then((items) => {
                let data = {};
                data[this.id] = items;
                return browser.storage.local.set(data);
            }).then(() => {
                return results;
            });
        }

        /**
         * Filters the item
         * @param {object} item - Object representing a filterable item
         * @param {number} [limit] - the limit of filtered items to return
         * @param {number} [offset] - the starting index of filtered items to return
         * @returns {object[]} - Array of currently filtered items
         */
        add(item, limit, offset) {
            console.log(`${this.name}.add()`, item);

            item = this.normalize(item);

            if (!this.isValid(item)) {
                throw new Error(`${this.getDisplayLabel(item)} is invalid`);    //@TODO i18n
            }

            const properties = this.properties.required.map(property => property.field);

            return this.getFilterData().then((items) => {
                const idx = Utils.FindObjectInArray(item, items, properties);
                if (idx >= 0) {
                    throw new Error(`${this.getDisplayLabel(item)} is already filtered`);    //@TODO i18n
                }

                item.created = Date.now();
                items.push(item);
                return items;
            }).then((items) => {
                let data = {};
                data[this.id] = items;
                return browser.storage.local.set(data);
            }).then(() => {
                return this.getFilterData(limit, offset);
            });
        }

        /**
         * Un-filters the item
         * @param {object} item - Object representing a filterable item
         * @param {number} [limit] - the limit of filtered items to return
         * @param {number} [offset] - the starting index of filtered items to return
         * @returns {object[]} - Array of currently filtered items
         */
        remove(item, limit, offset) {
            console.log(`${this.name}.remove()`, item);

            item = this.normalize(item);

            if (!this.isValid(item)) {
                throw new Error(`${this.getDisplayLabel(item)} is invalid`);    //@TODO i18n
            }

            const properties = this.properties.required.map(property => property.field);

            return this.getFilterData().then((items) => {
                const idx = Utils.FindObjectInArray(item, items, properties);
                if (idx < 0) {
                    throw new Error(`${this.getDisplayLabel(item)} is not filtered`);    //@TODO i18n
                }

                items.splice(idx, 1);
                return items;
            }).then((items) => {
                let data = {};
                data[this.id] = items;
                return browser.storage.local.set(data);
            }).then(() => {
                return this.getFilterData(limit, offset);
            });
        }

        /**
         * Filters or un-filters the item
         * @param {object} item - Object representing an item to be filtered/un-filtered
         * @param {number} [limit] - the limit of filtered items to return
         * @param {number} [offset] - the starting index of filtered items to return
         * @returns {object[]} - Array of currently filtered items
         */
        toggle(item) {
            console.log(`${this.name}.toggle()`, item);

            item = this.normalize(item);

            if (!this.isValid(item)) {
                throw new Error(`${this.getDisplayLabel(item)} is invalid`);    //@TODO i18n
            }

            return this.exists(item).then((exists) => {
                return exists ? this.remove(item) : this.add(item);
            });
        }

    }

    return Filter;

})();

export default Filter;

