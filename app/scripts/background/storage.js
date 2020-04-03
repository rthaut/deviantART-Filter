import { differenceWith, isEqual } from 'lodash';
import { SendMessageToAllTabs } from './messages';
import { LOCAL_STORAGE_CHANGED } from '../constants/messages';

export const OnLocalStorageChanged = (changes) => {
    for (const key of Object.keys(changes)) {
        const { oldValue, newValue } = changes[key];

        let added, removed;
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            added = differenceWith(newValue, oldValue, isEqual);
            removed = differenceWith(oldValue, newValue, isEqual);
        }

        SendStorageChangesToTabs(key, { added, removed, oldValue, newValue });
    }
};

const SendStorageChangesToTabs = (key, changes) => {
    SendMessageToAllTabs(LOCAL_STORAGE_CHANGED, { key, changes });
};
