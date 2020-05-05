import { differenceWith, isEqual } from 'lodash-es';
import { SendMessageToAllTabs } from './messages';
import { LOCAL_STORAGE_CHANGED } from '../constants/messages';

export const MONITORED_STORAGE_KEYS = [
    'categories',
    'keywords',
    'users',
];

export const OnLocalStorageChanged = (changes) => {
    console.time('OnLocalStorageChanged()');
    for (const key of Object.keys(changes)) {
        if (MONITORED_STORAGE_KEYS.includes(key)) {
            console.time(`OnLocalStorageChanged() :: ${key}`);
            const { oldValue, newValue } = changes[key];

            const added = differenceWith(newValue ?? [], oldValue ?? [], isEqual);
            const removed = differenceWith(oldValue ?? [], newValue ?? [], isEqual);

            SendStorageChangesToTabs(key, { added, removed, oldValue, newValue });
            console.timeEnd(`OnLocalStorageChanged() :: ${key}`);
        }
    }
    console.timeEnd('OnLocalStorageChanged()');
};

const SendStorageChangesToTabs = (key, changes) => {
    SendMessageToAllTabs(LOCAL_STORAGE_CHANGED, { key, changes });
};
