import {
  curry,
  differenceWith as diffWith,
  mapKeys,
  uniqWith,
} from "lodash-es";

import {
  FILTER_NOT_CREATED,
  FILTER_KEY_DISABLED,
} from "../constants/notifications";

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
 * Common methods used for each supported filter where logic is (or can be) unique per filter
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
 * Returns an array of all currently enabled filter keys
 * NOTE: initializes all supported filter keys as enabled (if the user has never toggled them yet)
 * @returns {Promise<string[]>} array of all enabled filter keys
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
 * Returns all filters for the given key
 * @param {string} filterKey the key of the filter
 */
export const GetFilters = async (filterKey) => {
  const allFilters = await GetAllFilters();
  const filters = Array.from(allFilters[filterKey] ?? []);

  return filters;
};

/**
 * Saves the given filters to extension storage
 * @param {string} filterKey the key of the filter
 * @param {any[]} filters the filters to save
 */
export const SaveFilters = async (filterKey, filters) => {
  await browser.storage.local.set({
    [filterKey]: FILTER_METHODS[filterKey].uniq(filters),
  });
};

/**
 * Adds a filter to extension storage
 * @param {string} filterKey the key of the filter
 * @param {any} newFilter the filter to add
 */
export const AddFilter = async (filterKey, newFilter) => {
  const filters = await GetFilters(filterKey);
  filters.push(newFilter);

  await SaveFilters(filterKey, filters);
};

/**
 * Removes an array of filters from extension storage
 * @param {string} filterKey the key of the filter
 * @param {any} filtersToRemove the array of filters to remove
 */
export const RemoveFilters = async (filterKey, filtersToRemove) => {
  let filters = await GetFilters(filterKey);
  filters = FILTER_METHODS[filterKey].diff(filters, filtersToRemove);

  await SaveFilters(filterKey, filters);
};

/**
 * Removes a single filter from extension storage
 * @param {string} filterKey the key of the filter
 * @param {any} filterToRemove the filter to remove
 */
export const RemoveFilter = (filterKey, filterToRemove) =>
  RemoveFilters(filterKey, [filterToRemove]);

/**
 * Updates a filter in extension storage
 * @param {string} filterKey the key of the filter
 * @param {any} prevFilter the previous version of the filter
 * @param {any} updatedFilter the updated version of the filter
 */
export const UpdateFilter = async (filterKey, prevFilter, updatedFilter) => {
  const filters = await GetFilters(filterKey);

  const index = FILTER_METHODS[filterKey].findIndex(filters, prevFilter);
  filters[index] = updatedFilter;

  await SaveFilters(filterKey, filters);
};

/**
 * Validates a new filter and ensures it is unique
 * @param {string} filterKey the key of the filter
 * @param {any} newFilter the new filter
 */
export const ValidateNewFilter = async (filterKey, newFilter) => {
  let { isValid, message } = FILTER_METHODS[filterKey].validate(newFilter);

  if (isValid) {
    const filters = await GetFilters(filterKey);
    const index = FILTER_METHODS[filterKey].findIndex(filters, newFilter);
    if (index > -1) {
      isValid = false;
      message = browser.i18n.getMessage("DuplicateFilterWarning");
    }
  }

  return { isValid, message };
};

/**
 * Validates an updated filter and ensures it is unique
 * @param {string} filterKey the key of the filter
 * @param {any} prevFilter the previous version of the filter
 * @param {any} updatedFilter the updated version of the filter
 */
export const ValidateUpdatedFilter = async (
  filterKey,
  prevFilter,
  updatedFilter,
) => {
  let { isValid, message } = FILTER_METHODS[filterKey].validate(updatedFilter);

  if (isValid) {
    const filters = await GetFilters(filterKey);
    filters.splice(FILTER_METHODS[filterKey].findIndex(filters, prevFilter), 1);

    const index = FILTER_METHODS[filterKey].findIndex(filters, updatedFilter);
    if (index > -1) {
      isValid = false;
      message = browser.i18n.getMessage("DuplicateFilterWarning");
    }
  }

  return { isValid, message };
};

/**
 * Imports the given filters into extension storage
 * @param {string} filterKey the key of the filter
 * @param {any[]} filters the filters to import
 */
export const ImportFilters = async (filterKey, filters) => {
  const existingFilters = await GetFilters(filterKey);
  const newFilters = FILTER_METHODS[filterKey].diff(filters, existingFilters);

  const validFilters = newFilters.filter((newFilter) => {
    const { isValid, message } = FILTER_METHODS[filterKey].validate(newFilter);
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
    filterKey,
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
    let filterKey = dataKey;
    let fileFilters = Array.from(data[dataKey] ?? []);

    if (Object.keys(MIGRATED_FILTERS).includes(filterKey)) {
      console.warn(
        `Migrating ${filterKey} filters to ${MIGRATED_FILTERS[dataKey].key}`,
      );
      // use the new storage key instead of the one in the file
      filterKey = MIGRATED_FILTERS[dataKey].key;
      // replace mapped property names with their new property name (no changes to unmapped properties)
      fileFilters = fileFilters.map((filter) =>
        mapKeys(
          filter,
          (_value, key) => MIGRATED_FILTERS[dataKey]["props"][key] ?? key,
        ),
      );
    }

    if (SUPPORTED_FILTERS.includes(filterKey)) {
      fileFilters.forEach((value) => {
        delete value.created;
      });
      results[filterKey] = await ImportFilters(filterKey, fileFilters);
    } else {
      results[filterKey] = {
        error: browser.i18n.getMessage("UnsupportedFilterError"),
      };
    }
  }

  return results;
};

/**
 * Validates and creates a new filter.
 * Optionally shows browser notifications on validation failure and/or when the specified filter key is currently disabled.
 * @param {string} filterKey the key of the filter
 * @param {any} filter the new filter
 * @param {boolean} [showNotifications=true] (Default `true`) if browser notifications should be shown
 * @returns {boolean} `true` if filter was created successfully
 */
export const ValidateAndCreateFilter = async (
  filterKey,
  filter,
  showNotifications = true,
) => {
  const { isValid, message } = await ValidateNewFilter(filterKey, filter);

  if (!isValid) {
    if (showNotifications) {
      await browser.notifications.create(`${filterKey}-${FILTER_NOT_CREATED}`, {
        type: "basic",
        iconUrl: browser.runtime.getURL("images/icon-64.png"),
        title: browser.i18n.getMessage("ExtensionName"),
        message: browser.i18n.getMessage(
          "Notification_FilterNotCreated_WithMessage",
          [message],
        ),
      });
    }
    return false;
  }

  await AddFilter(filterKey, filter);

  const enabledFilters = await GetEnabledFilters();

  if (!enabledFilters.includes(filterKey)) {
    if (showNotifications) {
      await browser.notifications.create(
        `${filterKey}-${FILTER_KEY_DISABLED}`,
        {
          type: "basic",
          iconUrl: browser.runtime.getURL("images/icon-64.png"),
          title: browser.i18n.getMessage("ExtensionName"),
          message: browser.i18n.getMessage(
            "Notification_FilterCreatedForDisabledFilterKey",
            [filterKey],
          ),
        },
      );
    }
  }

  return true;
};
