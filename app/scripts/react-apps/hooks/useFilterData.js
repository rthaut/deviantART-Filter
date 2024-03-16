import * as React from "react";
import PropTypes from "prop-types";

import useExtensionStorage from "./useExtensionStorage";

import { ENABLED_FILTERS_STORAGE_KEY, SUPPORTED_FILTERS } from "../../filters";

export const FilterDataContext = React.createContext();

export const FilterDataProvider = ({ filterKey, idPropName, children }) => {
  const [loading, setLoading] = React.useState(true);
  const [validFilters, setValidFilters] = React.useState([]);
  const [invalidFilters, setInvalidFilters] = React.useState([]);

  const [enabledFilters, setEnabledFilters] = useExtensionStorage({
    type: "local",
    key: ENABLED_FILTERS_STORAGE_KEY,
    initialValue: SUPPORTED_FILTERS,
  });

  const enabled = React.useMemo(
    () => enabledFilters.includes(filterKey),
    [filterKey, enabledFilters],
  );

  const setEnabled = React.useCallback(
    (enabled) =>
      setEnabledFilters((enabledFilters) => {
        const enabledFiltersSet = new Set([...enabledFilters]);

        if (enabled) {
          enabledFiltersSet.add(filterKey);
        } else {
          enabledFiltersSet.delete(filterKey);
        }

        return Array.from(enabledFiltersSet);
      }),
    [filterKey, setEnabledFilters],
  );

  const toggleEnabled = React.useCallback(
    () =>
      setEnabledFilters((enabledFilters) => {
        const enabledFiltersSet = new Set([...enabledFilters]);

        if (enabledFiltersSet.has(filterKey)) {
          enabledFiltersSet.delete(filterKey);
        } else {
          enabledFiltersSet.add(filterKey);
        }

        return Array.from(enabledFiltersSet);
      }),
    [filterKey, setEnabledFilters],
  );

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

  const sendFilterMessage = React.useCallback(
    async (action, value) => {
      const response = await browser.runtime.sendMessage({
        action,
        data: {
          key: filterKey,
          value,
        },
      });
      return response;
    },
    [filterKey],
  );

  const exportFiltersToFile = React.useCallback(
    (filtersToExport) => {
      const dataObj = new Blob(
        [JSON.stringify({ [filterKey]: filtersToExport })],
        {
          type: "application/json",
        },
      );
      const dataObjURL = URL.createObjectURL(dataObj);

      const date = new Date();
      const filename =
        browser.i18n.getMessage("ExtensionName").replace(" ", "_") +
        "_" +
        browser.i18n.getMessage(`FilterTitle_${filterKey}_Plural`);

      const link = document.createElement("a");
      link.href = dataObjURL;
      link.download = `${filename}-${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}.json`;
      link.dispatchEvent(new MouseEvent("click"));
    },
    [filterKey],
  );

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
    sendFilterMessage,
    exportFiltersToFile,
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
