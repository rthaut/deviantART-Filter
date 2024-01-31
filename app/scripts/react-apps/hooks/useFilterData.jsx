import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";

// TODO: move this into a provider+context, and then wrap the 2 router "Views" with the provider?
// that way we don't have to drill as many props from the FilterDataGrid into the sub-components...
// (the Provider could then take in the 2 params currently supplied to the hook)

const useFilterData = ({ filterKey, idPropName }) => {
  const [loading, setLoading] = useState(true);
  const [validFilters, setValidFilters] = useState([]);
  const [invalidFilters, setInvalidFilters] = useState([]);

  const isFilterValid = useCallback(
    (filter) =>
      typeof filter === "object" &&
      Object.keys(filter).includes(idPropName) &&
      filter[idPropName] !== undefined &&
      filter[idPropName] !== null &&
      String(filter[idPropName]).trim().length > 0,
    [idPropName],
  );

  const separateFiltersByValidity = useCallback(
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

  const onStorageChanged = useCallback(
    (changes, areaName) => {
      if (areaName === "local" && Object.keys(changes).includes(filterKey)) {
        setLoading(true);
        setRowStatesFromStorage(changes[filterKey]?.newValue);
        setLoading(false);
      }
    },
    [filterKey],
  );

  useEffect(() => {
    if (!browser.storage.onChanged.hasListener(onStorageChanged)) {
      browser.storage.onChanged.addListener(onStorageChanged);
    }

    return () => {
      if (browser.storage.onChanged.hasListener(onStorageChanged)) {
        browser.storage.onChanged.removeListener(onStorageChanged);
      }
    };
  }, []);

  useEffect(() => {
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

  const purgeInvalidFilters = useCallback(() => {
    browser.storage.local.set({
      [filterKey]: validFilters,
    });
  }, [filterKey, validFilters]);

  return {
    loading,
    validFilters,
    invalidFilters,
    purgeInvalidFilters,
  };
};

useFilterData.propTypes = {
  filterKey: PropTypes.string.isRequired,
  idPropName: PropTypes.string.isRequired,
};

export default useFilterData;
