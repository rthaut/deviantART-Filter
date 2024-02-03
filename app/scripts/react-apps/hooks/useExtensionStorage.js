import * as React from "react";
import PropTypes from "prop-types";

/**
 * A custom hook to get/set a value in extension storage
 * @param {Object} options the hook options
 * @param {string} options.type the type/area of extension storage
 * @param {string} options.key the key/name of value in extension storage
 * @param {any} options.initialValue the initial value
 * @returns {[any,Function]} a hook to get and set the value in extension storage
 */
const useExtensionStorage = ({ type, key, initialValue = undefined }) => {
  const [value, setValue] = React.useState(initialValue);

  const setAndPersistValue = React.useCallback(
    (newValueOrUpdater) =>
      setValue((prevValue) => {
        const newValue =
          typeof newValueOrUpdater === "function"
            ? newValueOrUpdater(prevValue)
            : newValueOrUpdater;

        browser.storage[type]?.set({
          [key]: newValue,
        });

        return newValue;
      }),
    [key],
  );

  React.useEffect(() => {
    browser.storage[type]?.get({ [key]: initialValue }).then((data) => {
      setValue(data[key]);
    });
  }, [type, key]);

  React.useEffect(() => {
    const onChangedHandler = (changes, areaName) => {
      if (areaName === type && Object.keys(changes).includes(key)) {
        setValue(changes[key].newValue ?? initialValue);
      }
    };

    if (!browser.storage.onChanged.hasListener(onChangedHandler)) {
      browser.storage.onChanged.addListener(onChangedHandler);
    }

    return () => {
      if (browser.storage.onChanged.hasListener(onChangedHandler)) {
        browser.storage.onChanged.removeListener(onChangedHandler);
      }
    };
  }, [type, key]);

  return [value, setAndPersistValue];
};

useExtensionStorage.propTypes = {
  type: PropTypes.string.isRequired,
  key: PropTypes.string.isRequired,
  initialValue: PropTypes.any,
};

export default useExtensionStorage;
