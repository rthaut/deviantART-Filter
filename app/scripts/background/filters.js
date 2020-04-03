import { isEqual, differenceWith, uniqWith, findIndex } from 'lodash';

export const AddFilter = async (filterKey, newFilter) => {
    console.time('AddFilter()');

    const storageData = await browser.storage.local.get(filterKey);
    const filters = Array.from(storageData[filterKey]);

    filters.push(newFilter);

    const data = {};
    data[filterKey] = uniqWith(filters, isEqual);
    await browser.storage.local.set(data);

    console.timeEnd('AddFilter()');
};

export const RemoveFilter = async (filterKey, oldFilter) => {
    console.time('RemoveFilter()');

    const storageData = await browser.storage.local.get(filterKey);
    let filters = Array.from(storageData[filterKey]);

    filters = differenceWith(filters, [oldFilter], isEqual);

    const data = {};
    data[filterKey] = uniqWith(filters, isEqual);
    await browser.storage.local.set(data);

    console.timeEnd('RemoveFilter()');
};

export const UpdateFilter = async (filterKey, oldFilter, newFilter) => {
    console.time('UpdateFilter()');

    const storageData = await browser.storage.local.get(filterKey);
    const filters = Array.from(storageData[filterKey]);

    const index = findIndex(filters, oldFilter);
    filters[index] = newFilter;

    const data = {};
    data[filterKey] = uniqWith(filters, isEqual);
    await browser.storage.local.set(data);

    console.timeEnd('UpdateFilter()');
};
