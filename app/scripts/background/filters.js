import { isEqual, differenceWith, uniqWith, findIndex } from 'lodash';

export const GetFilter = async (filterKey) => {
    console.time(`GetFilter() [${filterKey}]`);

    const storageData = await browser.storage.local.get(filterKey);
    const filters = Array.from(storageData[filterKey] ?? []);

    console.timeEnd(`GetFilter() [${filterKey}]`);
    return filters;
};

export const SaveFilter = async (filterKey, filters) => {
    console.time(`SaveFilter() [${filterKey}]`);

    const data = {};
    data[filterKey] = uniqWith(filters, isEqual);
    await browser.storage.local.set(data);

    console.timeEnd(`SaveFilter() [${filterKey}]`);
};

export const AddFilter = async (filterKey, newFilter) => {
    console.time(`AddFilter() [${filterKey}]`);

    const filters = await GetFilter(filterKey);
    filters.push(newFilter);
    await SaveFilter(filterKey, filters);

    console.timeEnd(`AddFilter() [${filterKey}]`);
};

export const RemoveFilter = async (filterKey, oldFilter) => {
    console.time(`RemoveFilter() [${filterKey}]`);

    let filters = await GetFilter(filterKey);
    filters = differenceWith(filters, [oldFilter], isEqual);
    await SaveFilter(filterKey, filters);

    console.timeEnd(`RemoveFilter() [${filterKey}]`);
};

export const UpdateFilter = async (filterKey, oldFilter, newFilter) => {
    console.time(`UpdateFilter() [${filterKey}]`);

    const filters = await GetFilter(filterKey);
    const index = findIndex(filters, oldFilter);
    filters[index] = newFilter;
    await SaveFilter(filterKey, filters);

    console.timeEnd(`UpdateFilter() [${filterKey}]`);
};

export const ImportFilters = async (filterKey, filters) => {
    console.time(`ImportFilters() [${filterKey}]`);

    const existingFilters = await GetFilter(filterKey);
    const newFilters = differenceWith(filters, existingFilters, isEqual);
    await SaveFilter(filterKey, Array.from([...existingFilters, ...newFilters]));

    const results = {
        'total': filters.length,
        'new': newFilters.length,
        'duplicate': filters.length - newFilters.length
    };

    console.timeEnd(`ImportFilters() [${filterKey}]`);
    return results;
};

export const ImportFromFileData = async (data) => {
    console.time('ImportFromFileData()');

    const results = {};
    for (const filterKey of Object.keys(data)) {
        const fileFilters = Array.from(data[filterKey] ?? []);
        results[filterKey] = await ImportFilters(filterKey, fileFilters);
    }

    console.timeEnd('ImportFromFileData()');
    return results;
};
