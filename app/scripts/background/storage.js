import { differenceWith, isEqual } from "lodash-es";

import { ENABLED_FILTERS_STORAGE_KEY, SUPPORTED_FILTERS } from "../filters";
import { SendMessageToAllTabs } from "./messages";
import { LOCAL_STORAGE_CHANGED } from "../constants/messages";
import { OPTIONS_STORAGE_KEY } from "../constants/options";

export const MONITORED_STORAGE_KEYS = [
  ENABLED_FILTERS_STORAGE_KEY,
  OPTIONS_STORAGE_KEY,
  ...SUPPORTED_FILTERS,
];

/**
 * Event handler for all storage changes
 * @param {object} changes the storage changes
 * @param {string} areaName the name of the changed storage area
 */
export const OnStorageChanged = (changes, areaName) => {
  switch (areaName) {
    case "local":
      OnLocalStorageChanged(changes);
      break;
  }
};

/**
 * Event handler for local storage changes
 * @param {object} changes the storage changes
 */
export const OnLocalStorageChanged = (changes) => {
  for (const key of Object.keys(changes)) {
    if (MONITORED_STORAGE_KEYS.includes(key)) {
      const { oldValue, newValue } = changes[key];

      const added = differenceWith(newValue ?? [], oldValue ?? [], isEqual);
      const removed = differenceWith(oldValue ?? [], newValue ?? [], isEqual);

      SendStorageChangesToTabs(key, { added, removed, oldValue, newValue });
    }
  }
};

const SendStorageChangesToTabs = (key, changes) => {
  SendMessageToAllTabs(LOCAL_STORAGE_CHANGED, { key, changes });
};
