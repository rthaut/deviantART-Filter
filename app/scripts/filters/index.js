import {
  curry,
  differenceWith as diffWith,
  mapKeys,
  uniqWith,
} from "lodash-es";

import {
  STORAGE_KEY as userFiltersStorageKey,
  UNIQUE_KEYS as userFiltersUniqueKeys,
  validate as validateUserFilter,
} from "./users";
import {
  STORAGE_KEY as keywordsFiltersStorageKey,
  UNIQUE_KEYS as keywordFiltersUniqueKeys,
  validate as validateKeywordFilter,
} from "./keywords";

export const ENABLED_FILTERS_STORAGE_KEY = "enabled-filters";

export const SUPPORTED_FILTERS = [
  userFiltersStorageKey,
  keywordsFiltersStorageKey,
];

export const MIGRATED_FILTERS = {
  // tags were changed to keywords in v6, so we need to change the storage key and the property names
  tags: {
    key: "keywords",
    props: {
      tag: "keyword",
    },
  },
};

const compareByAnyProps = curry((props, a, b) =>
  props.some(
    (prop) => String(a[prop]).toLowerCase() === String(b[prop]).toLowerCase(),
  ),
);

const compareByAllProps = curry((props, a, b) =>
  props.every(
    (prop) => String(a[prop]).toLowerCase() === String(b[prop]).toLowerCase(),
  ),
);

/**
 * Common methods used for each supported filter where logic is (or can be) unique per filter type
 */
export const FILTER_METHODS = {
  users: {
    diff: (array, values) =>
      diffWith(array, values, compareByAnyProps(userFiltersUniqueKeys)),
    uniq: (array) => uniqWith(array, compareByAnyProps(userFiltersUniqueKeys)),
    find: (array, value) =>
      array.find((el) => compareByAllProps(userFiltersUniqueKeys)(el, value)),
    findIndex: (array, value) =>
      array.findIndex((el) =>
        compareByAllProps(userFiltersUniqueKeys)(el, value),
      ),
    validate: validateUserFilter,
  },
  keywords: {
    diff: (array, values) =>
      diffWith(array, values, compareByAnyProps(keywordFiltersUniqueKeys)),
    uniq: (array) =>
      uniqWith(array, compareByAnyProps(keywordFiltersUniqueKeys)),
    find: (array, value) =>
      array.find((el) =>
        compareByAllProps(keywordFiltersUniqueKeys)(el, value),
      ),
    findIndex: (array, value) =>
      array.findIndex((el) =>
        compareByAllProps(keywordFiltersUniqueKeys)(el, value),
      ),
    validate: validateKeywordFilter,
  },
};

/**
 * Returns an array of all currently enabled filter types/keys
 * NOTE: initializes all supported filter types as enabled (if the user has never toggled them yet)
 * @returns {Promise<string[]>} array of all enabled filter types/keys
 */
export const GetEnabledFilters = async () => {
  const enabledFilters = await browser.storage.local
    .get({ [ENABLED_FILTERS_STORAGE_KEY]: SUPPORTED_FILTERS })
    .then((data) => data[ENABLED_FILTERS_STORAGE_KEY]);

  return enabledFilters;
};

/**
 * Returns all filters from extension storage
 */
export const GetAllFilters = async () => {
  const storageData = await browser.storage.local.get(SUPPORTED_FILTERS);

  return storageData;
};

/**
 * Returns all filters for the given type
 * @param {string} filterType the type of filter
 */
export const GetFilters = async (filterType) => {
  const allFilters = await GetAllFilters();
  const filters = Array.from(allFilters[filterType] ?? []);

  return filters;
};

/**
 * Saves the given filters to extension storage
 * @param {string} filterType the type of filter
 * @param {any[]} filters the filters to save
 */
export const SaveFilters = async (filterType, filters) => {
  await browser.storage.local.set({
    [filterType]: FILTER_METHODS[filterType].uniq(filters),
  });
};

/**
 * Adds a filter to extension storage
 * @param {string} filterType the type of filter
 * @param {any} newFilter the filter to add
 */
export const AddFilter = async (filterType, newFilter) => {
  const filters = await GetFilters(filterType);
  filters.push(newFilter);

  await SaveFilters(filterType, filters);
};

/**
 * Removes a filter from extension storage
 * @param {string} filterType the type of filter
 * @param {any} oldFilter the filter to remove
 */
export const RemoveFilter = async (filterType, oldFilter) => {
  let filters = await GetFilters(filterType);
  filters = FILTER_METHODS[filterType].diff(filters, [oldFilter]);

  await SaveFilters(filterType, filters);
};

/**
 * Updates a filter in extension storage
 * @param {string} filterType the type of filter
 * @param {any} prevFilter the previous version of the filter
 * @param {any} updatedFilter the updated version of the filter
 */
export const UpdateFilter = async (filterType, prevFilter, updatedFilter) => {
  const filters = await GetFilters(filterType);

  const index = FILTER_METHODS[filterType].findIndex(filters, prevFilter);
  filters[index] = updatedFilter;

  await SaveFilters(filterType, filters);
};

/**
 * Validates a new filter and ensures it is unique
 * @param {string} filterType the type of filter
 * @param {any} newFilter the new filter
 */
export const ValidateNewFilter = async (filterType, newFilter) => {
  let { isValid, message } = FILTER_METHODS[filterType].validate(newFilter);

  if (isValid) {
    const filters = await GetFilters(filterType);
    const index = FILTER_METHODS[filterType].findIndex(filters, newFilter);
    if (index > -1) {
      isValid = false;
      message = browser.i18n.getMessage("DuplicateFilterWarning");
    }
  }

  return { isValid, message };
};

/**
 * Validates an updated filter and ensures it is unique
 * @param {string} filterType the type of filter
 * @param {any} prevFilter the previous version of the filter
 * @param {any} updatedFilter the updated version of the filter
 */
export const ValidateUpdatedFilter = async (
  filterType,
  prevFilter,
  updatedFilter,
) => {
  let { isValid, message } = FILTER_METHODS[filterType].validate(updatedFilter);

  if (isValid) {
    const filters = await GetFilters(filterType);
    filters.splice(
      FILTER_METHODS[filterType].findIndex(filters, prevFilter),
      1,
    );

    const index = FILTER_METHODS[filterType].findIndex(filters, updatedFilter);
    if (index > -1) {
      isValid = false;
      message = browser.i18n.getMessage("DuplicateFilterWarning");
    }
  }

  return { isValid, message };
};

/**
 * Imports the given filters into extension storage
 * @param {string} filterType the type of filter
 * @param {any[]} filters the filters to import
 */
export const ImportFilters = async (filterType, filters) => {
  const existingFilters = await GetFilters(filterType);
  const newFilters = FILTER_METHODS[filterType].diff(filters, existingFilters);

  const validFilters = newFilters.filter((newFilter) => {
    const { isValid, message } = FILTER_METHODS[filterType].validate(newFilter);
    if (!isValid) {
      console.warn(
        "Filter is invalid, will not be imported:",
        message,
        newFilter,
      );
    }
    return isValid;
  });

  await SaveFilters(
    filterType,
    Array.from([...existingFilters, ...validFilters]),
  );

  const results = {
    total: filters.length,
    new: validFilters.length,
    duplicate: filters.length - newFilters.length,
    invalid: newFilters.length - validFilters.length,
  };

  return results;
};

/**
 * Imports the given filter data into extension storage
 * @param {any[]} data the filter data to import
 */
export const BulkImportFilters = async (data) => {
  const results = {};
  for (const dataKey of Object.keys(data)) {
    let filterType = dataKey;
    let fileFilters = Array.from(data[dataKey] ?? []);

    if (Object.keys(MIGRATED_FILTERS).includes(filterType)) {
      console.warn(
        `Migrating ${filterType} filters to ${MIGRATED_FILTERS[dataKey].key}`,
      );
      // use the new storage key instead of the one in the file
      filterType = MIGRATED_FILTERS[dataKey].key;
      // replace mapped property names with their new property name (no changes to unmapped properties)
      fileFilters = fileFilters.map((filter) =>
        mapKeys(
          filter,
          (_value, key) => MIGRATED_FILTERS[dataKey]["props"][key] ?? key,
        ),
      );
    }

    if (SUPPORTED_FILTERS.includes(filterType)) {
      fileFilters.forEach((value) => {
        delete value.created;
      });
      results[filterType] = await ImportFilters(filterType, fileFilters);
    } else {
      results[filterType] = {
        error: browser.i18n.getMessage("UnsupportedFilterError"),
      };
    }
  }

  return results;
};
