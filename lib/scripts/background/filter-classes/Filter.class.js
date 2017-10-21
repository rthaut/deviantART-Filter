import Utils from '../../../helpers/utils';
import BrowserTabs from '../browser-tabs';

const Filter = (() => {

    class Filter {

        /**
         * Filter constructor
         * @param {string} id - The unique identified for the filter (used as the "key" used for local storage)
         * @param {string} name - The internal "name" (NOT translated) of the filter (used for retrieving localized messages)
         * @param {objectp[]} properties - The properties available for the filter to utilize
         */
        constructor(id, name, properties) {
            this.id = id;
            this.name = name;
            this.properties = properties;
        }

        /**
         * Returns a "friendly" name for the filter item
         * @param {object} item - The filter item
         * @returns {string} - The "friendly" display string
         */
        getDisplayLabel(item) {
            let label = browser.i18n.getMessage(`FilterType${this.name}Name`);

            const props = this.properties.filter(property => property.required).map(property => property.field);
            if (props.length) {
                // include the first required property, assuming it is the most important
                label += ` "${item[props[0]]}"`;
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
         * @param {number} [limit] - The limit of filtered items to retrieve
         * @param {number} [offset] - The starting index of filtered items to retrieve
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
         * Sends data needed by the filter to a specific tab
         * @param {tab} tab - The browser tab to which the filter data should be sent
         */
        sendFilterDataToTab(tab) {
            console.log(`${this.name}.sendFilterDataToTab()`, tab);

            return this.getFilterData().then((items) => {
                return BrowserTabs.sendMessageToTab(tab, {
                    'action': 'update-filter',
                    'data': {
                        'filter': {
                            'id': this.id,
                            'data': items
                        }
                    }
                });
            });
        }

        /**
         * Sends the updated data needed by the filter to all browser tabs
         */
        sendFilterDataToAllTabs() {
            console.log(`${this.name}.sendFilterDataToAllTabs()`);

            return this.getFilterData().then((items) => {
                return BrowserTabs.sendMessageToAllTabs({
                    'action': 'update-filter',
                    'data': {
                        'filter': {
                            'id': this.id,
                            'data': items
                        }
                    }
                });
            });
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
            console.log(`${this.name}.isValid()`);

            const props = this.properties.filter(property => property.required);
            for (let i = 0; i < props.length; i++) {
                const prop = props[i];

                if (item[prop.field] === undefined) {
                    console.log(`Required property "${prop.title}" is missing`);
                    return false;
                }

                const value = item[prop.field];

                if ((prop.type === 'text') && !value.length) {
                    console.log(`Property "${prop.title}" is empty`);
                    return false;
                }

                if (prop.pattern !== undefined) {
                    console.log(`Checking property "${prop.title}" against pattern`, prop.pattern, value);
                    if (new RegExp(prop.pattern).test(value) === false) {
                        console.log(`Property "${prop.title}" does not match the expected pattern`);
                        return false;
                    }
                }
            }

            return true;
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
                throw new Error(browser.i18n.getMessage('ErrorInvalidFilterItem', [this.getDisplayLabel(item)]));
            }

            const props = this.properties.filter(property => property.required).map(property => property.field);

            return this.getFilterData().then((items) => {
                return (Utils.FindObjectInArray(item, items, props) >= 0);
            });
        }

        /**
         * Imports the provided items into the filter
         * @param {object[]} items - The filter items to import
         * @returns {object} - A summary of the import results
         */
        import(items) {
            console.log(`${this.name}.import()`, items);

            const props = this.properties.filter(property => property.required).map(property => property.field);

            const results = {
                'total': items.length,
                'success': 0,
                'invalid': 0,
                'duplicate': 0
            };

            return this.getFilterData().then((existing) => {

                for (let item of items) {
                    item = this.normalize(item);

                    if (!this.isValid(item)) {
                        console.log('Invalid item', item);
                        results.invalid++;
                        continue;
                    }

                    const idx = Utils.FindObjectInArray(item, existing, props);
                    if (idx >= 0) {
                        console.log('Duplicate item', item);
                        results.duplicate++;
                    } else {
                        item.created = Date.now();
                        existing.push(item);
                        results.success++;
                    }
                }

                return existing;
            }).then((items) => {
                const data = {};
                data[this.id] = items;
                return browser.storage.local.set(data);
            }).then(() => {
                return results;
            });
        }

        /**
         * Filters the item
         * @param {object} item - Object representing a filterable item
         * @param {number} [limit] - The limit of filtered items to return
         * @param {number} [offset] - The starting index of filtered items to return
         * @returns {object[]} - Array of currently filtered items
         */
        add(item, limit, offset) {
            console.log(`${this.name}.add()`, item);

            item = this.normalize(item);

            if (!this.isValid(item)) {
                throw new Error(browser.i18n.getMessage('ErrorInvalidFilterItem', [this.getDisplayLabel(item)]));
            }

            const props = this.properties.filter(property => property.required).map(property => property.field);

            return this.getFilterData().then((items) => {
                const idx = Utils.FindObjectInArray(item, items, props);
                if (idx >= 0) {
                    throw new Error(browser.i18n.getMessage('ErrorDuplicateFilterItem', [this.getDisplayLabel(item)]));
                }

                item.created = Date.now();
                items.push(item);
                return items;
            }).then((items) => {
                const data = {};
                data[this.id] = items;
                return browser.storage.local.set(data);
            }).then(() => {
                return this.getFilterData(limit, offset);
            });
        }

        /**
         * Un-filters the item
         * @param {object} item - Object representing a filterable item
         * @param {number} [limit] - The limit of filtered items to return
         * @param {number} [offset] - The starting index of filtered items to return
         * @returns {object[]} - Array of currently filtered items
         */
        remove(item, limit, offset) {
            console.log(`${this.name}.remove()`, item);

            item = this.normalize(item);

            const props = this.properties.filter(property => property.required).map(property => property.field);

            return this.getFilterData().then((items) => {
                const idx = Utils.FindObjectInArray(item, items, props);
                if (idx < 0) {
                    throw new Error(browser.i18n.getMessage('ErrorMissingFilterItem', [this.getDisplayLabel(item)]));
                }

                items.splice(idx, 1);
                return items;
            }).then((items) => {
                const data = {};
                data[this.id] = items;
                return browser.storage.local.set(data);
            }).then(() => {
                return this.getFilterData(limit, offset);
            });
        }

        /**
         * Filters or un-filters the item
         * @param {object} item - Object representing an item to be filtered/un-filtered
         * @param {number} [limit] - The limit of filtered items to return
         * @param {number} [offset] - The starting index of filtered items to return
         * @returns {object[]} - Array of currently filtered items
         */
        toggle(item) {
            console.log(`${this.name}.toggle()`, item);

            item = this.normalize(item);

            //TODO: should this check be run only when adding a new filter? currently the remove logic does NOT check validity...
            if (!this.isValid(item)) {
                throw new Error(browser.i18n.getMessage('ErrorInvalidFilterItem', [this.getDisplayLabel(item)]));
            }

            return this.exists(item).then((exists) => {
                return exists ? this.remove(item) : this.add(item);
            });
        }

    }

    return Filter;

})();

export default Filter;

