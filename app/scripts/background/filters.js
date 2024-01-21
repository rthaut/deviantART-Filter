import { differenceBy, find, findIndex, mapKeys, uniqBy } from "lodash-es";

export const SUPPORTED_FILTERS = ["users", "keywords"];

export const MIGRATED_FILTERS = {
  // tags were changed to keywords in v6, so we need to change the storage key and the property names
  tags: {
    key: "keywords",
    props: {
      tag: "keyword",
    },
  },
};

/**
 * Common methods used for each supported filter where logic is (or can be) unique per filter type
 */
// TODO: should these be put somewhere else, like maybe a file per filter that available to all scripts?
// TODO: these methods are all currently case-sensitive, but they really should be case-insensitive
export const FILTER_METHODS = {
  users: {
    diff: (array, values) => differenceBy(array, values, "username"),
    uniq: (array) => uniqBy(array, "username"),
    find: (array, value) => find(array, ["username", value.username]),
    findIndex: (array, value) => findIndex(array, ["username", value.username]),
  },
  keywords: {
    diff: (array, values) => differenceBy(array, values, "keyword"),
    uniq: (array) => uniqBy(array, "keyword"),
    find: (array, value) => find(array, ["keyword", value.keyword]),
    findIndex: (array, value) => findIndex(array, ["keyword", value.keyword]),
  },
};

export const GetAllFilters = async () => {
  console.time("GetAllFilters()");

  const storageData = await browser.storage.local.get(SUPPORTED_FILTERS);

  console.timeEnd("GetAllFilters()");
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
  data[storageKey] = FILTER_METHODS[storageKey].uniq(filters);
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
  filters = FILTER_METHODS[storageKey].diff(filters, [oldFilter]);

  await SaveFilter(storageKey, filters);

  console.timeEnd(`RemoveFilter() [${storageKey}]`);
};

export const UpdateFilter = async (storageKey, oldFilter, newFilter) => {
  console.time(`UpdateFilter() [${storageKey}]`);

  const filters = await GetFilter(storageKey);

  const index = FILTER_METHODS[storageKey].findIndex(filters, oldFilter);
  filters[index] = newFilter;

  await SaveFilter(storageKey, filters);

  console.timeEnd(`UpdateFilter() [${storageKey}]`);
};

export const ValidateNewFilter = async (storageKey, newFilter) => {
  console.time(`ValidateNewFilter() [${storageKey}]`);

  const result = {
    isValid: true,
  };

  const filters = await GetFilter(storageKey);

  const index = FILTER_METHODS[storageKey].findIndex(filters, newFilter);
  if (index > -1) {
    result.isValid = false;
    result.message = browser.i18n.getMessage("DuplicateFilterWarning");
  }

  console.timeEnd(`ValidateNewFilter() [${storageKey}]`);
  return result;
};

export const ValidateUpdatedFilter = async (
  storageKey,
  oldFilter,
  newFilter,
) => {
  console.time(`ValidateUpdatedFilter() [${storageKey}]`);

  const result = {
    isValid: true,
  };

  const filters = await GetFilter(storageKey);
  filters.splice(FILTER_METHODS[storageKey].findIndex(filters, oldFilter), 1);

  const index = FILTER_METHODS[storageKey].findIndex(filters, newFilter);
  if (index > -1) {
    result.isValid = false;
    result.message = browser.i18n.getMessage("DuplicateFilterWarning");
  }

  console.timeEnd(`ValidateUpdatedFilter() [${storageKey}]`);
  return result;
};

export const ImportFilter = async (storageKey, filters) => {
  console.time(`ImportFilter() [${storageKey}]`);

  const existingFilters = await GetFilter(storageKey);
  const newFilters = FILTER_METHODS[storageKey].diff(filters, existingFilters);
  await SaveFilter(storageKey, Array.from([...existingFilters, ...newFilters]));

  const results = {
    total: filters.length,
    new: newFilters.length,
    duplicate: filters.length - newFilters.length,
  };

  console.timeEnd(`ImportFilter() [${storageKey}]`);
  return results;
};

export const ImportFilters = async (data) => {
  console.time("ImportFilters()");

  const results = {};
  for (const dataKey of Object.keys(data)) {
    let storageKey = dataKey;
    let fileFilters = Array.from(data[dataKey] ?? []);

    if (Object.keys(MIGRATED_FILTERS).includes(storageKey)) {
      console.debug(`Migrating "${storageKey}" filters`, fileFilters);

      // use the new storage key instead of the one in the file
      storageKey = MIGRATED_FILTERS[dataKey].key;
      // replace mapped property names with their new property name (no changes to unmapped properties)
      fileFilters = fileFilters.map((filter) =>
        mapKeys(
          filter,
          (_value, key) => MIGRATED_FILTERS[dataKey]["props"][key] ?? key,
        ),
      );

      console.debug(`Migrated "${storageKey}" filters`, fileFilters);
    }

    if (SUPPORTED_FILTERS.includes(storageKey)) {
      fileFilters.forEach((value) => {
        delete value.created;
      });
      results[storageKey] = await ImportFilter(storageKey, fileFilters);
    } else {
      results[storageKey] = {
        error: browser.i18n.getMessage("UnsupportedFilterError"),
      };
    }
  }

  console.timeEnd("ImportFilters()");
  return results;
};
