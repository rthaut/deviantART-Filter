import * as React from "react";
import PropTypes from "prop-types";

import useExtensionStorage from "./useExtensionStorage";

import { ENABLED_FILTERS_STORAGE_KEY, SUPPORTED_FILTERS } from "../../filters";

export const FilterDataContext = React.createContext();

export const FilterDataProvider = ({ filterKey, idPropName, children }) => {
  const [loading, setLoading] = React.useState(true);
  const [validFilters, setValidFilters] = React.useState([]);
  const [invalidFilters, setInvalidFilters] = React.useState([]);

  const [enabledFilterTypes, setEnabledFilterTypes] = useExtensionStorage({
    type: "local",
    key: ENABLED_FILTERS_STORAGE_KEY,
    initialValue: SUPPORTED_FILTERS,
  });

  const enabled = enabledFilterTypes.includes(filterKey);

  const setEnabled = (enabled) =>
    setEnabledFilterTypes((enabledFilterTypes) => {
      const enabledFilterTypesSet = new Set([...enabledFilterTypes]);

      if (enabled) {
        enabledFilterTypesSet.add(filterKey);
      } else {
        enabledFilterTypesSet.delete(filterKey);
      }

      return Array.from(enabledFilterTypesSet);
    });

  const toggleEnabled = () =>
    setEnabledFilterTypes((enabledFilterTypes) => {
      const enabledFilterTypesSet = new Set([...enabledFilterTypes]);

      if (enabledFilterTypesSet.has(filterKey)) {
        enabledFilterTypesSet.delete(filterKey);
      } else {
        enabledFilterTypesSet.add(filterKey);
      }

      return Array.from(enabledFilterTypesSet);
    });

  const purgeInvalidFilters = React.useCallback(() => {
    browser.storage.local.set({
      [filterKey]: validFilters,
    });
  }, [filterKey, validFilters]);

  const isFilterValid = React.useCallback(
    (filter) =>
      typeof filter === "object" &&
      Object.keys(filter).includes(idPropName) &&
      filter[idPropName] !== undefined &&
      filter[idPropName] !== null &&
      String(filter[idPropName]).trim().length > 0,
    [idPropName],
  );

  const separateFiltersByValidity = React.useCallback(
    (rawFilterData = []) => {
      const valid = [];
      const invalid = [];

      const validIDs = new Set();

      Array.from(rawFilterData).forEach((filter) => {
        if (!isFilterValid(filter)) {
          invalid.push({ reason: "missing_id_prop", filter });
        } else if (validIDs.has(String(filter[idPropName]).toLowerCase())) {
          invalid.push({ reason: "duplicate_id_prop", filter });
        } else {
          valid.push(filter);
          validIDs.add(String(filter[idPropName]).toLowerCase());
        }
      });

      return { valid, invalid };
    },
    [idPropName],
  );

  const setRowStatesFromStorage = (rawFilterData = []) => {
    const { valid, invalid } = separateFiltersByValidity(rawFilterData);
    setValidFilters(valid);
    setInvalidFilters(invalid);
  };

  React.useEffect(() => {
    setLoading(true);
    browser.storage.local
      .get(filterKey)
      .then((storageData) => {
        setRowStatesFromStorage(storageData[filterKey]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filterKey]);

  React.useEffect(() => {
    const onStorageChanged = (changes, areaName) => {
      if (areaName === "local" && Object.keys(changes).includes(filterKey)) {
        setLoading(true);
        setRowStatesFromStorage(changes[filterKey]?.newValue);
        setLoading(false);
      }
    };

    if (!browser.storage.onChanged.hasListener(onStorageChanged)) {
      browser.storage.onChanged.addListener(onStorageChanged);
    }

    return () => {
      if (browser.storage.onChanged.hasListener(onStorageChanged)) {
        browser.storage.onChanged.removeListener(onStorageChanged);
      }
    };
  }, [filterKey]);

  const value = {
    filterKey,
    idPropName,
    enabled,
    setEnabled,
    toggleEnabled,
    loading,
    validFilters,
    invalidFilters,
    purgeInvalidFilters,
  };

  return (
    <FilterDataContext.Provider value={value}>
      {children}
    </FilterDataContext.Provider>
  );
};

FilterDataProvider.propTypes = {
  filterKey: PropTypes.string.isRequired,
  idPropName: PropTypes.string.isRequired,
  children: PropTypes.element,
};

export const useFilterData = () => React.useContext(FilterDataContext);
