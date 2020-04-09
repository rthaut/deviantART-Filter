import { isEqual, differenceWith, mapKeys, uniqWith, findIndex } from 'lodash';

export const SUPPORTED_FILTERS = [
    'users',
    'keywords',
    'categories',
];

export const MIGRATED_FILTERS = {
    // tags were changed to keywords in v6, so we need to change the storage key and the property names
    'tags': {
        'key': 'keywords',
        'props': {
            'tag': 'keyword'
        },
    }
};

export const GetAllFilters = async () => {
    console.time('GetAllFilters()');

    console.debug(SUPPORTED_FILTERS);
    const storageData = await browser.storage.local.get(SUPPORTED_FILTERS);
    console.debug(storageData);

    console.timeEnd('GetAllFilters()');
    return storageData;
};

export const GetFilter = async (storageKey) => {
    console.time(`GetFilter() [${storageKey}]`);

    const storageData = await browser.storage.local.get(storageKey);
    const filters = Array.from(storageData[storageKey] ?? []);

    console.timeEnd(`GetFilter() [${storageKey}]`);
    return filters;
};

export const SaveFilter = async (storageKey, filters) => {
    console.time(`SaveFilter() [${storageKey}]`);

    const data = {};
    data[storageKey] = uniqWith(filters, isEqual);
    await browser.storage.local.set(data);

    console.timeEnd(`SaveFilter() [${storageKey}]`);
};

export const AddFilter = async (storageKey, newFilter) => {
    console.time(`AddFilter() [${storageKey}]`);

    const filters = await GetFilter(storageKey);
    filters.push(newFilter);
    await SaveFilter(storageKey, filters);

    console.timeEnd(`AddFilter() [${storageKey}]`);
};

export const RemoveFilter = async (storageKey, oldFilter) => {
    console.time(`RemoveFilter() [${storageKey}]`);

    let filters = await GetFilter(storageKey);
    filters = differenceWith(filters, [oldFilter], isEqual);
    await SaveFilter(storageKey, filters);

    console.timeEnd(`RemoveFilter() [${storageKey}]`);
};

export const UpdateFilter = async (storageKey, oldFilter, newFilter) => {
    console.time(`UpdateFilter() [${storageKey}]`);

    const filters = await GetFilter(storageKey);
    const index = findIndex(filters, oldFilter);
    filters[index] = newFilter;
    await SaveFilter(storageKey, filters);

    console.timeEnd(`UpdateFilter() [${storageKey}]`);
};

export const ImportFilters = async (storageKey, filters) => {
    console.time(`ImportFilters() [${storageKey}]`);

    const existingFilters = await GetFilter(storageKey);
    const newFilters = differenceWith(filters, existingFilters, isEqual);
    await SaveFilter(storageKey, Array.from([...existingFilters, ...newFilters]));

    const results = {
        'total': filters.length,
        'new': newFilters.length,
        'duplicate': filters.length - newFilters.length
    };

    console.timeEnd(`ImportFilters() [${storageKey}]`);
    return results;
};

export const ImportFromFileData = async (data) => {
    console.time('ImportFromFileData()');

    const results = {};
    for (const dataKey of Object.keys(data)) {
        let storageKey = dataKey;
        let fileFilters = Array.from(data[dataKey] ?? []);

        if (Object.keys(MIGRATED_FILTERS).includes(storageKey)) {
            console.debug(`Migrating "${storageKey}" filters`, fileFilters);

            // use the new storage key instead of the one in the file
            storageKey = MIGRATED_FILTERS[dataKey].key;
            // replace mapped property names with their new property name (no changes to unmapped properties)
            fileFilters = fileFilters.map(filter => mapKeys(filter, (_value, key) => MIGRATED_FILTERS[dataKey]['props'][key] ?? key));

            console.debug(`Migrated "${storageKey}" filters`, fileFilters);
        }

        if (SUPPORTED_FILTERS.includes(storageKey)) {
            fileFilters.forEach(value => { delete value.created; });
            results[storageKey] = await ImportFilters(storageKey, fileFilters);
        } else {
            results[storageKey] = {
                'error': 'Unsupported filter type'
            };
        }
    }

    console.timeEnd('ImportFromFileData()');
    return results;
};
