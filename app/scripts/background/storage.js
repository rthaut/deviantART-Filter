import { differenceWith, isEqual } from 'lodash';
import { SendMessageToAllTabs } from './messages';
import { LOCAL_STORAGE_CHANGED } from '../constants/messages';

export const MONITORED_STORAGE_KEYS = [
    'categories',
    'keywords',
    'users',
];

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
